package com.pranaveda.category;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findAllByOrderByNameAsc();

    Optional<Tag> findBySlug(String slug);

    List<Tag> findBySlugIn(Collection<String> slugs);

    boolean existsBySlug(String slug);
}
