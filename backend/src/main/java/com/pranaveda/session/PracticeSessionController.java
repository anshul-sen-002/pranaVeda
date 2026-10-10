package com.pranaveda.session;

import com.pranaveda.common.dto.PageResponse;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Practice-session endpoints (agents.md 2.9, 2.10). All routes live under
 * {@code /api/v1/me/**}, which the security chain restricts to authenticated
 * users, and every operation re-resolves the owner from the security context -
 * a user can only ever touch their own sessions.
 */
@Tag(name = "Practice sessions")
@RestController
@RequestMapping("/api/v1/me/practice-sessions")
public class PracticeSessionController {

    private final PracticeSessionService sessionService;

    public PracticeSessionController(PracticeSessionService sessionService) {
        this.sessionService = sessionService;
    }

    /**
     * Records a completed practice - the explicit "finish session" action.
     * A practice counts only here, never by opening a timer (agents.md 2.10).
     */
    @PostMapping
    public ResponseEntity<PracticeSessionDto> record(@Valid @RequestBody PracticeSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.record(request));
    }

    /** The caller's practice history, newest first, paginated. */
    @GetMapping
    public PageResponse<PracticeSessionDto> list(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return sessionService.list(page, size);
    }

    /** Aggregate practice totals for the dashboard (agents.md 2.9). */
    @GetMapping("/stats")
    public PracticeStatsDto stats() {
        return sessionService.stats();
    }

    /** One of the caller's sessions by id. */
    @GetMapping("/{id}")
    public PracticeSessionDto get(@PathVariable long id) {
        return sessionService.get(id);
    }

    /** Deletes one of the caller's sessions. Idempotent. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        sessionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
