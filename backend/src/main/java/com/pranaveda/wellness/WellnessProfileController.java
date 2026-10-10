package com.pranaveda.wellness;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Wellness profile endpoints (agents.md 2.8). All under {@code /api/v1/me/**}
 * (authenticated); the service re-resolves the owner from the security context.
 * Supports the four personal-data rights: read, edit, export, delete.
 */
@Tag(name = "Wellness profile")
@RestController
@RequestMapping("/api/v1/me/wellness-profile")
public class WellnessProfileController {

    private final WellnessProfileService wellnessProfileService;

    public WellnessProfileController(WellnessProfileService wellnessProfileService) {
        this.wellnessProfileService = wellnessProfileService;
    }

    /** Read the caller's wellness profile. */
    @GetMapping
    public WellnessProfileDto get() {
        return wellnessProfileService.get();
    }

    /** Create or fully update the caller's wellness profile. */
    @PutMapping
    public WellnessProfileDto upsert(@Valid @RequestBody WellnessProfileRequest request) {
        return wellnessProfileService.upsert(request);
    }

    /** Export the caller's own data (personal-data export right). */
    @GetMapping("/export")
    public WellnessProfileDto export() {
        return wellnessProfileService.export();
    }

    /** Delete the caller's wellness profile. Idempotent. */
    @DeleteMapping
    public ResponseEntity<Void> delete() {
        wellnessProfileService.delete();
        return ResponseEntity.noContent().build();
    }
}
