package com.pranaveda.audio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Audio-track persistence (agents.md 2.12). Public reads are filtered to
 * PUBLISHED tracks at the query level so drafts/archived tracks never leak, and
 * the streaming URL is resolved from the referenced media asset by the service,
 * never stored as a public link on the track.
 */
public interface AudioTrackRepository extends JpaRepository<AudioTrack, Long> {

    Optional<AudioTrack> findBySlug(String slug);

    /** Published tracks only, newest first (public library). */
    @Query("""
        SELECT t FROM AudioTrack t
        WHERE t.status = com.pranaveda.audio.AudioStatus.PUBLISHED
        ORDER BY t.publishedAt DESC, t.id DESC
        """)
    Page<AudioTrack> findPublished(Pageable pageable);

    /** Published tracks in a category, newest first. */
    @Query("""
        SELECT t FROM AudioTrack t
        WHERE t.status = com.pranaveda.audio.AudioStatus.PUBLISHED AND t.category = :category
        ORDER BY t.publishedAt DESC, t.id DESC
        """)
    Page<AudioTrack> findPublishedByCategory(@Param("category") AudioCategory category, Pageable pageable);

    /** A single published track by slug; drafts/archived are invisible here. */
    @Query("""
        SELECT t FROM AudioTrack t
        WHERE t.slug = :slug AND t.status = com.pranaveda.audio.AudioStatus.PUBLISHED
        """)
    Optional<AudioTrack> findPublishedBySlug(@Param("slug") String slug);

    /** Admin listing across all statuses, newest-created first. */
    List<AudioTrack> findAllByOrderByCreatedAtDesc();
}
