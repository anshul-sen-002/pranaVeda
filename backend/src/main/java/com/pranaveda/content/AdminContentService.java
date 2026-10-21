package com.pranaveda.content;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import com.pranaveda.bookmark.BookmarkRepository;
import com.pranaveda.bookmark.BookmarkTarget;
import com.pranaveda.category.Category;
import com.pranaveda.category.CategoryRepository;
import com.pranaveda.category.Tag;
import com.pranaveda.category.TagRepository;
import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.util.SlugUtil;
import com.pranaveda.media.MediaAsset;
import com.pranaveda.media.MediaKind;
import com.pranaveda.media.MediaRepository;
import com.pranaveda.media.MediaService;
import com.pranaveda.security.CurrentUserPrincipal;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin content workflows: create/update always yield DRAFT state,
 * publication is an explicit transition (architecture section 15, Phase 3).
 * Editor identity comes from the security context - never from the request.
 */
@Service
public class AdminContentService {

    private static final int MAX_TARGET_AREA_LENGTH = 40;

    private final ContentRepository contentRepository;
    private final ContentItemFacetRepository facetRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final ContentStepRepository stepRepository;
    private final MediaRepository mediaRepository;
    private final MediaService mediaService;
    private final BookmarkRepository bookmarks;

    public AdminContentService(ContentRepository contentRepository,
                               ContentItemFacetRepository facetRepository,
                               CategoryRepository categoryRepository,
                               TagRepository tagRepository,
                               ContentStepRepository stepRepository,
                               MediaRepository mediaRepository,
                               MediaService mediaService,
                               BookmarkRepository bookmarks) {
        this.contentRepository = contentRepository;
        this.facetRepository = facetRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.stepRepository = stepRepository;
        this.mediaRepository = mediaRepository;
        this.mediaService = mediaService;
        this.bookmarks = bookmarks;
    }

    /**
     * ADMIN: deletes a content item and all of its stored media (agents.md 2.15
     * cleanup). Removes the featured image and every guided-step image from
     * Cloudinary + {@code media_assets}, then the content row, and finally all
     * member bookmarks pointing at it. Cloudinary deletion is best-effort.
     */
    @Transactional
    public void delete(long id) {
        ContentItem item = getItem(id);
        List<MediaAsset> assets = mediaRepository.findByContentIdAndKind(id, MediaKind.CONTENT_IMAGE);
        for (MediaAsset asset : assets) {
            mediaService.deleteAdminAsset(asset.getId());
        }
        bookmarks.deleteByTargetTypeAndTargetId(BookmarkTarget.CONTENT, id);
        contentRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContentSummary> list(ContentQuery rawQuery, ContentStatus status) {
        ContentQuery query = rawQuery.normalized();
        var page = contentRepository.findAll(
            ContentSpecification.forAdmin(query, status),
            PageRequest.of(query.page(), query.size(), query.toSort("createdAt")));

        Map<Long, List<ContentItemFacet>> facetMap = ContentItemFacetRepository.groupByContentId(
            facetRepository.findByContentIdIn(page.getContent().stream().map(ContentItem::getId).toList()));
        List<ContentSummary> content = page.getContent().stream()
            .map(item -> ContentMapper.summary(item, facetMap.getOrDefault(item.getId(), List.of())))
            .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ContentDetail get(long id) {
        return detail(getItem(id));
    }

    @Transactional
    public ContentDetail create(AdminContentRequest request) {
        ContentItem item = new ContentItem();
        item.setSlug(resolveNewSlug(request.slug(), request.title()));
        apply(item, request);
        item.setStatus(ContentStatus.DRAFT);
        long editor = CurrentUserPrincipal.requireCurrentUserId();
        item.setCreatedBy(editor);
        item.setUpdatedBy(editor);
        ContentItem saved = contentRepository.save(item);
        saveFacets(saved.getId(), request);
        return detail(saved);
    }

    @Transactional
    public ContentDetail update(long id, AdminContentRequest request) {
        ContentItem item = getItem(id);
        String requestedSlug = trimToNull(request.slug());
        if (requestedSlug != null) {
            String slug = SlugUtil.slugify(requestedSlug);
            if (!slug.isEmpty() && !slug.equals(item.getSlug()) && contentRepository.existsBySlug(slug)) {
                throw new ConflictException("Another content item already uses slug '" + slug + "'.");
            }
            if (!slug.isEmpty()) {
                item.setSlug(slug);
            }
        }
        apply(item, request);
        item.setUpdatedBy(CurrentUserPrincipal.requireCurrentUserId());
        saveFacets(item.getId(), request);
        return detail(item);
    }

    @Transactional
    public ContentDetail publish(long id) {
        return transition(id, ContentStatus.PUBLISHED);
    }

    @Transactional
    public ContentDetail unpublish(long id) {
        return transition(id, ContentStatus.DRAFT);
    }

    @Transactional
    public ContentDetail archive(long id) {
        return transition(id, ContentStatus.ARCHIVED);
    }

    private ContentDetail transition(long id, ContentStatus target) {
        ContentItem item = getItem(id);
        if (item.getStatus() != target) {
            if (target == ContentStatus.PUBLISHED) {
                requireNarrationApproved(item); // publish is the approval gate for AI drafts
            }
            if (target == ContentStatus.PUBLISHED && item.getPublishedAt() == null) {
                item.setPublishedAt(Instant.now()); // records the FIRST publication date
            }
            item.setStatus(target);
            item.setUpdatedBy(CurrentUserPrincipal.requireCurrentUserId());
        }
        return detail(item);
    }

    /**
     * Publishing a pose with guided steps requires every step to carry
     * narration text - an AI draft must be reviewed/edited (or generated)
     * before the pose goes live. Steps without images are fine; a step
     * without text is not.
     */
    private void requireNarrationApproved(ContentItem item) {
        List<ContentStep> steps = stepRepository.findByContentIdOrderByStepOrderAsc(item.getId());
        for (int i = 0; i < steps.size(); i++) {
            if (steps.get(i).getInstruction() == null || steps.get(i).getInstruction().isBlank()) {
                throw new BadRequestException(
                    "Step " + (i + 1) + " has no narration text. Edit or generate instructions "
                        + "for every step before publishing.");
            }
        }
    }

    /** Full detail projection including facets and ordered guided steps. */
    private ContentDetail detail(ContentItem item) {
        return ContentMapper.detail(item,
            facetRepository.findByContentId(item.getId()),
            stepRepository.findByContentIdOrderByStepOrderAsc(item.getId()));
    }

    // --- request -> entity mapping ----------------------------------------

    private void apply(ContentItem item, AdminContentRequest request) {
        item.setTitle(request.title().trim());
        item.setSummary(trimToNull(request.summary()));
        item.setDescription(trimToNull(request.description()));
        item.setCommonName(trimToNull(request.commonName()));
        item.setSanskritName(trimToNull(request.sanskritName()));
        item.setContentType(request.contentType());
        item.setDifficulty(request.difficulty());
        item.setDurationMinutes(request.durationMinutes());
        item.setFeaturedImageUrl(trimToNull(request.featuredImageUrl()));
        item.setFeaturedVideoUrl(trimToNull(request.featuredVideoUrl()));
        item.setInstructions(trimToNull(request.instructions()));
        item.setBreathingNotes(trimToNull(request.breathingNotes()));
        item.setModifications(trimToNull(request.modifications()));
        item.setSafetyPrecautions(trimToNull(request.safetyPrecautions()));
        item.setBenefits(trimToNull(request.benefits()));
        item.setEvidenceNotes(trimToNull(request.evidenceNotes()));
        item.setSeoTitle(trimToNull(request.seoTitle()));
        item.setSeoDescription(trimToNull(request.seoDescription()));
        item.setCategories(resolveCategories(request.categorySlugs()));
        item.setTags(resolveTags(request.tagSlugs()));
    }

    private Set<Category> resolveCategories(List<String> slugs) {
        List<String> wanted = normalizeSlugs(slugs);
        if (wanted.isEmpty()) {
            return new LinkedHashSet<>();
        }
        List<Category> found = categoryRepository.findBySlugIn(wanted);
        Set<String> foundSlugs = found.stream().map(Category::getSlug)
            .collect(java.util.stream.Collectors.toSet());
        List<String> missing = wanted.stream().filter(slug -> !foundSlugs.contains(slug)).toList();
        if (!missing.isEmpty()) {
            throw new BadRequestException("Unknown category slugs: " + String.join(", ", missing));
        }
        return new LinkedHashSet<>(found);
    }

    private Set<Tag> resolveTags(List<String> slugs) {
        List<String> wanted = normalizeSlugs(slugs);
        if (wanted.isEmpty()) {
            return new LinkedHashSet<>();
        }
        List<Tag> found = tagRepository.findBySlugIn(wanted);
        Set<String> foundSlugs = found.stream().map(Tag::getSlug)
            .collect(java.util.stream.Collectors.toSet());
        List<String> missing = wanted.stream().filter(slug -> !foundSlugs.contains(slug)).toList();
        if (!missing.isEmpty()) {
            throw new BadRequestException("Unknown tag slugs: " + String.join(", ", missing));
        }
        return new LinkedHashSet<>(found);
    }

    /** Goals validated against the Goal whitelist; target areas normalized. */
    private void saveFacets(Long contentId, AdminContentRequest request) {
        facetRepository.deleteByContentId(contentId);
        List<ContentItemFacet> facets = new ArrayList<>();
        if (request.goals() != null) {
            request.goals().stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .distinct()
                .map(Goal::fromApiValue) // unknown value -> BadRequestException
                .forEach(goal -> facets.add(new ContentItemFacet(contentId, FacetType.GOAL, goal.name())));
        }
        if (request.targetAreas() != null) {
            request.targetAreas().stream()
                .filter(value -> value != null && !value.isBlank())
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .distinct()
                .peek(value -> {
                    if (value.length() > MAX_TARGET_AREA_LENGTH) {
                        throw new BadRequestException("Target area too long: " + value);
                    }
                })
                .forEach(value -> facets.add(new ContentItemFacet(contentId, FacetType.TARGET_AREA, value)));
        }
        if (!facets.isEmpty()) {
            facetRepository.saveAll(facets);
        }
    }

    private String resolveNewSlug(String requestedSlug, String title) {
        String requested = trimToNull(requestedSlug);
        String base = requested != null ? SlugUtil.slugify(requested) : SlugUtil.slugify(title);
        if (base.isEmpty()) {
            throw new BadRequestException("Cannot derive a slug from the given title/slug.");
        }
        if (!contentRepository.existsBySlug(base)) {
            return base;
        }
        if (requested != null) {
            throw new ConflictException("Another content item already uses slug '" + base + "'.");
        }
        for (int suffix = 2; suffix <= 50; suffix++) {
            String candidate = base + "-" + suffix;
            if (!contentRepository.existsBySlug(candidate)) {
                return candidate;
            }
        }
        throw new ConflictException("Could not derive a unique slug from the title.");
    }

    private static List<String> normalizeSlugs(List<String> slugs) {
        if (slugs == null) {
            return List.of();
        }
        return slugs.stream()
            .filter(slug -> slug != null && !slug.isBlank())
            .map(slug -> slug.trim().toLowerCase(Locale.ROOT))
            .distinct()
            .toList();
    }

    private ContentItem getItem(long id) {
        return contentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Content not found."));
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}


