package com.pranaveda.content;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentStepRepository extends JpaRepository<ContentStep, Long> {

    List<ContentStep> findByContentIdOrderByStepOrderAsc(Long contentId);

    long countByContentId(Long contentId);

    boolean existsByIdAndContentId(Long id, Long contentId);
}
