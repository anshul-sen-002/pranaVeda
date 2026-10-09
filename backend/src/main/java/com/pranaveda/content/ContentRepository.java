package com.pranaveda.content;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ContentRepository extends JpaRepository<ContentItem, Long>,
        JpaSpecificationExecutor<ContentItem> {

    Optional<ContentItem> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
