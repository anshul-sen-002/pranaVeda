package com.pranaveda.content;

import java.util.ArrayList;
import java.util.List;

import com.pranaveda.category.Category;
import com.pranaveda.category.Tag;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import org.springframework.data.jpa.domain.Specification;

/**
 * Filter predicates for content lists. All user input reaches the query only
 * as bound parameters; {@code q} wildcards are escaped. Category / tag / goal
 * filters use EXISTS subqueries so pagination counts stay exact (no join
 * row multiplication).
 */
public final class ContentSpecification {

    private ContentSpecification() {
    }

    /** Anonymous/public view: PUBLISHED items only - the visibility rule lives here. */
    public static Specification<ContentItem> forPublic(ContentQuery query) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ContentStatus.PUBLISHED));
            addFilters(root, cq, cb, predicates, query);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Admin view: any status (null = all). */
    public static Specification<ContentItem> forAdmin(ContentQuery query, ContentStatus status) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            addFilters(root, cq, cb, predicates, query);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addFilters(Root<ContentItem> root, CriteriaQuery<?> cq, CriteriaBuilder cb,
                                   List<Predicate> predicates, ContentQuery query) {
        if (query.contentType() != null) {
            predicates.add(cb.equal(root.get("contentType"), query.contentType()));
        }
        if (query.difficulty() != null) {
            predicates.add(cb.equal(root.get("difficulty"), query.difficulty()));
        }
        if (query.durationMax() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("durationMinutes"), query.durationMax()));
        }
        if (query.q() != null) {
            String pattern = "%" + escapeLike(query.q().toLowerCase()) + "%";
            predicates.add(cb.or(
                cb.like(cb.lower(root.get("title")), pattern, '\\'),
                cb.like(cb.lower(root.get("summary")), pattern, '\\'),
                cb.like(cb.lower(root.get("commonName")), pattern, '\\'),
                cb.like(cb.lower(root.get("sanskritName")), pattern, '\\'),
                cb.like(cb.lower(root.get("description")), pattern, '\\')));
        }
        if (query.category() != null) {
            predicates.add(hasCategory(root, cq, cb, query.category()));
        }
        for (String tagSlug : query.tags()) {
            predicates.add(hasTag(root, cq, cb, tagSlug));
        }
        if (query.goal() != null) {
            predicates.add(hasFacet(root, cq, cb, FacetType.GOAL, query.goal().name()));
        }
    }

    private static Predicate hasCategory(Root<ContentItem> root, CriteriaQuery<?> cq,
                                         CriteriaBuilder cb, String categorySlug) {
        Subquery<Integer> sq = cq.subquery(Integer.class);
        Root<ContentItem> inner = sq.from(ContentItem.class);
        Join<ContentItem, Category> category = inner.join("categories");
        sq.select(category.<Integer>get("id"));
        sq.where(cb.equal(inner.get("id"), root.get("id")),
                 cb.equal(category.get("slug"), categorySlug));
        return cb.exists(sq);
    }

    private static Predicate hasTag(Root<ContentItem> root, CriteriaQuery<?> cq,
                                    CriteriaBuilder cb, String tagSlug) {
        Subquery<Integer> sq = cq.subquery(Integer.class);
        Root<ContentItem> inner = sq.from(ContentItem.class);
        Join<ContentItem, Tag> tag = inner.join("tags");
        sq.select(tag.<Integer>get("id"));
        sq.where(cb.equal(inner.get("id"), root.get("id")),
                 cb.equal(tag.get("slug"), tagSlug));
        return cb.exists(sq);
    }

    private static Predicate hasFacet(Root<ContentItem> root, CriteriaQuery<?> cq,
                                      CriteriaBuilder cb, FacetType type, String value) {
        Subquery<Integer> sq = cq.subquery(Integer.class);
        Root<ContentItemFacet> facet = sq.from(ContentItemFacet.class);
        sq.select(facet.<Integer>get("id"));
        sq.where(cb.equal(facet.get("contentId"), root.get("id")),
                 cb.equal(facet.get("facetType"), type),
                 cb.equal(facet.get("facetValue"), value));
        return cb.exists(sq);
    }

    /** Escapes LIKE wildcards so user input never broadens the match. */
    static String escapeLike(String value) {
        return value
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");
    }
}
