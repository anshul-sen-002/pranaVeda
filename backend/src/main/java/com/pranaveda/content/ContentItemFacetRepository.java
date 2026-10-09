package com.pranaveda.content;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContentItemFacetRepository extends JpaRepository<ContentItemFacet, Long> {

    List<ContentItemFacet> findByContentIdIn(Collection<Long> contentIds);

    List<ContentItemFacet> findByContentId(Long contentId);

    /** Bulk delete (executes immediately) so re-inserting the same facets cannot hit the unique constraint. */
    @Modifying
    @Query("DELETE FROM ContentItemFacet f WHERE f.contentId = :contentId")
    void deleteByContentId(@Param("contentId") Long contentId);

    static Map<Long, List<ContentItemFacet>> groupByContentId(List<ContentItemFacet> facets) {
        return facets.stream().collect(Collectors.groupingBy(ContentItemFacet::getContentId));
    }
}

