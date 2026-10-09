package com.pranaveda.category;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByNameAsc();

    Optional<Category> findBySlug(String slug);

    List<Category> findBySlugIn(java.util.Collection<String> slugs);

    boolean existsBySlug(String slug);
}
