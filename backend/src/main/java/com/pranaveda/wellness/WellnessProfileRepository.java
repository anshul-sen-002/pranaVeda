package com.pranaveda.wellness;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Wellness profile persistence. Always queried on {@code userId} resolved from
 * the security context, so a user can never reach another's private health data
 * by guessing IDs (IDOR rule, architecture section 6).
 */
public interface WellnessProfileRepository extends JpaRepository<WellnessProfile, Long> {

    Optional<WellnessProfile> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
