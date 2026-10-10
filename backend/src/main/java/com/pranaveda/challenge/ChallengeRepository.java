package com.pranaveda.challenge;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/** Challenge definitions. Public list only ever reads PUBLISHED challenges. */
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    List<Challenge> findByStatusOrderByCreatedAtAsc(ChallengeStatus status);

    boolean existsBySlug(String slug);
}
