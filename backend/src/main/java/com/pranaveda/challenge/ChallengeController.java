package com.pranaveda.challenge;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 7-day challenge endpoints (agents.md 2.11). Public routes list published
 * challenges; member routes under {@code /api/v1/me/**} require auth and
 * re-resolve the owner from the security context. Day completion is idempotent.
 */
@Tag(name = "Challenges")
@RestController
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    /** Published challenges - open to anyone. */
    @GetMapping("/api/v1/challenges")
    public List<ChallengeDto> listPublished() {
        return challengeService.listPublished();
    }

    /** A single published challenge - open to anyone. */
    @GetMapping("/api/v1/challenges/{id}")
    public ChallengeDto getPublished(@PathVariable long id) {
        return challengeService.getPublished(id);
    }

    /** Joins a published challenge (idempotent). */
    @PostMapping("/api/v1/me/challenges/{id}/join")
    public ResponseEntity<ChallengeProgressDto> join(@PathVariable("id") long challengeId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(challengeService.join(challengeId));
    }

    /** The caller's progress in a joined challenge. */
    @GetMapping("/api/v1/me/challenges/{id}")
    public ChallengeProgressDto progress(@PathVariable("id") long challengeId) {
        return challengeService.progress(challengeId);
    }

    /** All challenges the caller has joined. */
    @GetMapping("/api/v1/me/challenges")
    public List<ChallengeProgressDto> myParticipations() {
        return challengeService.myParticipations();
    }

    /** Marks today's challenge day complete. Idempotent - retries do not double-count. */
    @PostMapping("/api/v1/me/challenges/{id}/complete-day")
    public ChallengeProgressDto completeDay(@PathVariable("id") long challengeId,
                                            @Valid @RequestBody CompleteDayRequest request) {
        return challengeService.completeDay(challengeId, request);
    }

    /** Leaves a challenge (removes participation and its day records). */
    @DeleteMapping("/api/v1/me/challenges/{id}")
    public ResponseEntity<Void> leave(@PathVariable("id") long challengeId) {
        challengeService.leave(challengeId);
        return ResponseEntity.noContent().build();
    }
}
