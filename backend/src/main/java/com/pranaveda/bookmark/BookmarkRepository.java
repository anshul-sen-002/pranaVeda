package com.pranaveda.bookmark;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

/**
 * Bookmark persistence. Every read/write is scoped by {@code userId} resolved
 * from the security context, so one user can never see or mutate another's
 * saved items. {@link JpaSpecificationExecutor} powers the filtered/sorted
 * Saved Library page (all filters are plain columns - no joins needed).
 */
public interface BookmarkRepository extends JpaRepository<Bookmark, Long>, JpaSpecificationExecutor<Bookmark> {

    Optional<Bookmark> findByUserIdAndTargetTypeAndTargetId(Long userId, BookmarkTarget targetType, Long targetId);

    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, BookmarkTarget targetType, Long targetId);

    /** Derived delete - idempotent, no-op when absent. */
    void deleteByUserIdAndTargetTypeAndTargetId(Long userId, BookmarkTarget targetType, Long targetId);
}
