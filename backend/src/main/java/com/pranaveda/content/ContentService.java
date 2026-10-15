package com.pranaveda.content;

import java.util.List;
import java.util.Map;

import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.NotFoundException;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Public, read-only access to the content library.
 * The publication-visibility rule lives here: anonymous readers (and the
 * public endpoint generally) only ever see PUBLISHED items - drafts and
 * archived items do not exist as far as the public API is concerned.
 */
@Service
public class ContentService {

    private final ContentRepository contentRepository;
    private final ContentItemFacetRepository facetRepository;
    private final ContentStepRepository stepRepository;

    public ContentService(ContentRepository contentRepository,
                          ContentItemFacetRepository facetRepository,
                          ContentStepRepository stepRepository) {
        this.contentRepository = contentRepository;
        this.facetRepository = facetRepository;
        this.stepRepository = stepRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ContentSummary> list(ContentQuery rawQuery) {
        ContentQuery query = rawQuery.normalized();
        var page = contentRepository.findAll(
            ContentSpecification.forPublic(query),
            PageRequest.of(query.page(), query.size(), query.toSort("publishedAt")));

        Map<Long, List<ContentItemFacet>> facetMap =
            ContentItemFacetRepository.groupByContentId(facetRepository.findByContentIdIn(idsOf(page.getContent())));
        List<ContentSummary> content = page.getContent().stream()
            .map(item -> ContentMapper.summary(item, facetMap.getOrDefault(item.getId(), List.of())))
            .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ContentDetail getPublished(String slug) {
        ContentItem item = contentRepository.findBySlug(slug)
            .orElseThrow(() -> notFound());
        if (item.getStatus() != ContentStatus.PUBLISHED) {
            throw notFound(); // never leak the existence of drafts/archived items
        }
        // Steps ride along only after the status check above, so guided
        // content of a draft can never leak through this public endpoint.
        return ContentMapper.detail(item,
            facetRepository.findByContentId(item.getId()),
            stepRepository.findByContentIdOrderByStepOrderAsc(item.getId()));
    }

    static NotFoundException notFound() {
        return new NotFoundException("Content not found.");
    }

    private static List<Long> idsOf(List<ContentItem> items) {
        return items.stream().map(ContentItem::getId).toList();
    }
}
