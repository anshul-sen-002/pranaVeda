package com.pranaveda.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.Check;

/**
 * One goal or target-body-area value attached to a content item
 * (table content_item_facets). Deliberately no JPA association to
 * ContentItem: facets are written/read by content id, keeping list queries
 * join-free.
 */
@Entity
@Table(name = "content_item_facets",
    uniqueConstraints = @UniqueConstraint(name = "uq_content_facet",
        columnNames = {"content_id", "facet_type", "facet_value"}),
    indexes = {
        @Index(name = "ix_content_facets_lookup", columnList = "facet_type, facet_value"),
        @Index(name = "ix_content_facets_content", columnList = "content_id")})
@Check(constraints = "facet_type IN ('GOAL', 'TARGET_AREA')")
public class ContentItemFacet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "facet_type", nullable = false, length = 20)
    private FacetType facetType;

    @Column(name = "facet_value", nullable = false, length = 40)
    private String facetValue;

    public ContentItemFacet() {
    }

    public ContentItemFacet(Long contentId, FacetType facetType, String facetValue) {
        this.contentId = contentId;
        this.facetType = facetType;
        this.facetValue = facetValue;
    }

    public Long getId() {
        return id;
    }

    public Long getContentId() {
        return contentId;
    }

    public FacetType getFacetType() {
        return facetType;
    }

    public String getFacetValue() {
        return facetValue;
    }
}
