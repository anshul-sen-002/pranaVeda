package com.pranaveda.challenge;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Challenge participation persistence. Always queried on {@code userId} from
 * the security context so a member can never reach another's participation
 * (IDOR rule).
 */
public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, Long> {

    Optional<ChallengeParticipation> findByUserIdAndChallengeId(Long userId, Long challengeId);

    Optional<ChallengeParticipation> findByIdAndUserId(Long id, Long userId);

    List<ChallengeParticipation> findByUserIdOrderByStartedAtDesc(Long userId);
}
