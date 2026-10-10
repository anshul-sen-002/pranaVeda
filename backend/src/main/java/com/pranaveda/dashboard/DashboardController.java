package com.pranaveda.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Member dashboard endpoint (agents.md 2.9). Lives under {@code /api/v1/me/**},
 * so the security chain requires authentication and the service re-resolves the
 * owner from the security context. Composes streak, practice totals, saved
 * count, challenge progress, and recent saved items in one round-trip.
 */
@Tag(name = "Dashboard")
@RestController
@RequestMapping("/api/v1/me/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /** The caller's dashboard payload. Owner-scoped; activity figures only. */
    @GetMapping
    public DashboardDto get() {
        return dashboardService.get();
    }
}
