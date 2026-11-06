package com.pranaveda.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pranaveda.security.CurrentUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Member dashboard endpoint (agents.md 2.9). Lives under {@code /api/v1/me/**},
 * so the security chain requires authentication and the service re-resolves the
 * owner from the security context. Composes all dashboard panels in one
 * round-trip, with a per-user five-minute Redis cache.
 */
@Tag(name = "Dashboard")
@RestController
@RequestMapping("/api/v1/me/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /** The caller's complete dashboard payload, owner-scoped. */
    @GetMapping
    public DashboardPageDto get() {
        return dashboardService.get(CurrentUserPrincipal.requireCurrentUserId());
    }
}
