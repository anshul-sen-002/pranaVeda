package com.pranaveda.category;

import java.util.List;
import java.util.Locale;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.util.SlugUtil;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Category and tag reads (public) and writes (admin). */
@Service
public class TaxonomyService {

    private final CategoryRepository categories;
    private final TagRepository tags;

    public TaxonomyService(CategoryRepository categories, TagRepository tags) {
        this.categories = categories;
        this.tags = tags;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> listCategories() {
        return categories.findAllByOrderByNameAsc().stream().map(CategoryDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<TagDto> listTags() {
        return tags.findAllByOrderByNameAsc().stream().map(TagDto::from).toList();
    }

    @Transactional
    public CategoryDto createCategory(AdminTaxonomyRequest request) {
        Category category = new Category();
        category.setName(request.name().trim());
        category.setSlug(resolveNewSlug(request.slug(), request.name(), categories::existsBySlug));
        category.setDescription(blankToNull(request.description()));
        return CategoryDto.from(categories.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(long id, AdminTaxonomyRequest request) {
        Category category = categories.findById(id)
            .orElseThrow(() -> new NotFoundException("Category not found."));
        applySlugChange(category::getSlug, category::setSlug, request.slug(),
            slug -> categories.existsBySlug(slug) && !slug.equals(category.getSlug()));
        category.setName(request.name().trim());
        category.setDescription(blankToNull(request.description()));
        return CategoryDto.from(category);
    }

    @Transactional
    public TagDto createTag(AdminTaxonomyRequest request) {
        Tag tag = new Tag();
        tag.setName(request.name().trim());
        tag.setSlug(resolveNewSlug(request.slug(), request.name(), tags::existsBySlug));
        return TagDto.from(tags.save(tag));
    }

    @Transactional
    public TagDto updateTag(long id, AdminTaxonomyRequest request) {
        Tag tag = tags.findById(id)
            .orElseThrow(() -> new NotFoundException("Tag not found."));
        applySlugChange(tag::getSlug, tag::setSlug, request.slug(),
            slug -> tags.existsBySlug(slug) && !slug.equals(tag.getSlug()));
        tag.setName(request.name().trim());
        return TagDto.from(tag);
    }

    private interface SlugExists {
        boolean test(String slug);
    }

    private static String resolveNewSlug(String requestedSlug, String name, SlugExists exists) {
        String base = deriveSlug(requestedSlug, name);
        if (exists.test(base)) {
            throw new ConflictException("Slug '" + base + "' is already in use.");
        }
        return base;
    }

    /**
     * Applies a slug change on update. Slugs are public URLs, so the slug is
     * preserved unless the request supplies an explicit one - renaming a record
     * must not break existing links (agents.md 2.4/3.2). An explicit slug is
     * slugified, rejected when empty, and a collision with a different record
     * is a 409; an unchanged slug is a no-op.
     */
    private static void applySlugChange(java.util.function.Supplier<String> current,
                                        java.util.function.Consumer<String> setter,
                                        String requestedSlug,
                                        SlugExists conflictsWithExisting) {
        String requested = blankToNull(requestedSlug);
        if (requested == null) {
            return; // no explicit slug: keep the stable public URL
        }
        String base = SlugUtil.slugify(requested);
        if (base.isEmpty()) {
            throw new BadRequestException("Cannot derive a slug from the given slug.");
        }
        if (base.equals(current.get())) {
            return;
        }
        if (conflictsWithExisting.test(base)) {
            throw new ConflictException("Slug '" + base + "' is already in use.");
        }
        setter.accept(base);
    }

    private static String deriveSlug(String requestedSlug, String name) {
        String requested = blankToNull(requestedSlug);
        String base = requested != null ? SlugUtil.slugify(requested) : SlugUtil.slugify(name);
        if (base.isEmpty()) {
            throw new BadRequestException("Cannot derive a slug from the given name/slug.");
        }
        return base;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
