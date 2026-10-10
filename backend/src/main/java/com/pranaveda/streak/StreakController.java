package com.pranaveda.streak;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Streak endpoint (agents.md 2.11). Lives under {@code /api/v1/me/**}, so the
 * security chain requires authentication and the service re-resolves the owner
 * from the security context. The streak is always computed server-side from
 * recorded practice days - it is never trusted from the client.
 */
@Tag(name = "Streaks")
@RestController
@RequestMapping("/api/v1/me/streaks")
public class StreakController {

    private final StreakService streakService;

    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    /** The caller's current streak snapshot (current, longest, humane policy flags). */
    @GetMapping
    public StreakDto current() {
        return streakService.current();
    }
}
