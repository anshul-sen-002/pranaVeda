package com.pranaveda.audio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Audio-favorite persistence (agents.md 2.12). Every query is keyed on
 * {@code userId} resolved from the security context, so a member can only read
 * or mutate their own favorites.
 */
public interface AudioFavoriteRepository extends JpaRepository<AudioFavorite, Long> {

    /** The member's favorites, most-recent first (owner-scoped). */
    Page<AudioFavorite> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<AudioFavorite> findByUserIdAndTrackId(Long userId, Long trackId);

    boolean existsByUserIdAndTrackId(Long userId, Long trackId);

    long countByUserId(Long userId);

    void deleteByUserIdAndTrackId(Long userId, Long trackId);

    /** Ids of the member's favorited tracks, for a page-load "isFavorite" check. */
    List<AudioFavorite> findByUserId(Long userId);
}
