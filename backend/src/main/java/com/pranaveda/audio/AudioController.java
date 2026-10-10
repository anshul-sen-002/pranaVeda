package com.pranaveda.audio;

import com.pranaveda.common.dto.PageResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Public calm-music endpoints (agents.md 2.12). Anonymous visitors may browse
 * and stream published tracks without logging in; only download requires a
 * signed-in member (enforced in the media download endpoint, not here). Draft
 * and archived tracks are filtered out at the query level and never leak.
 */
@Tag(name = "Calm music")
@RestController
@RequestMapping("/api/v1/audio")
public class AudioController {

    private final AudioService audioService;

    public AudioController(AudioService audioService) {
        this.audioService = audioService;
    }

    /** Published track list, newest first. Public. */
    @GetMapping
    public PageResponse<AudioTrackSummary> list(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return audioService.list(page, size);
    }

    /** Published tracks filtered by category. Public. */
    @GetMapping("/category/{category}")
    public PageResponse<AudioTrackSummary> listByCategory(
            @PathVariable AudioCategory category,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return audioService.listByCategory(category, page, size);
    }

    /** A single published track with its stream URL. Public. */
    @GetMapping("/{slug}")
    public ResponseEntity<AudioDetailDto> bySlug(@PathVariable String slug) {
        return ResponseEntity.ok(audioService.bySlug(slug));
    }
}
