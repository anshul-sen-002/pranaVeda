package com.pranaveda.routine;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Routine persistence. Always queried on {@code userId} resolved from the
 * security context, so a user can never reach or mutate another user's routine
 * by guessing an id (IDOR rule). Routines are private by default.
 */
public interface RoutineRepository extends JpaRepository<Routine, Long> {

    List<Routine> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<Routine> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
