package com.pranaveda.audio;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Listening-history persistence (agents.md 2.12). Append-only and owner-scoped;
 * every query resolves the owner from the security context.
 */
public interface AudioListeningHistoryRepository extends JpaRepository<AudioListeningHistory, Long> {

    /** The member's recent plays, newest first (owner-scoped, paginated). */
    Page<AudioListeningHistory> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    /** Lets a member clear a single history entry they own. */
    Optional<AudioListeningHistory> findByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
