package com.pranaveda.audio;

import com.pranaveda.common.dto.PageResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin audio studio (agents.md 2.12, 2.15). Protected by
 * {@code /api/v1/admin/** -> hasRole("ADMIN")} in SecurityConfig.
 *
 * <p>Upload flow: files go to {@code POST /api/v1/admin/media} first with
 * {@code kind=AUDIO} (audio file) or {@code kind=CONTENT_IMAGE} (cover art);
 * the returned asset {@code id} is then attached here. Covers and audio are
 * validated by kind server-side - a profile photo or video id is rejected.
 */
@Tag(name = "Admin audio")
@RestController
@RequestMapping("/api/v1/admin/audio")
public class AdminAudioController {

    private final AdminAudioService service;

    public AdminAudioController(AdminAudioService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<AudioDetailDto> list() {
        return service.list();
    }

    @PostMapping
    public ResponseEntity<AudioDetailDto> create(@Valid @RequestBody AdminAudioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/{id}")
    public AudioDetailDto get(@PathVariable long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public AudioDetailDto update(@PathVariable long id, @Valid @RequestBody AdminAudioRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/audio-asset")
    public AudioDetailDto attachAudio(@PathVariable long id, @RequestParam long assetId) {
        return service.attachAudio(id, assetId);
    }

    @PostMapping("/{id}/cover-asset")
    public AudioDetailDto attachCover(@PathVariable long id, @RequestParam long assetId) {
        return service.attachCover(id, assetId);
    }

    @PostMapping("/{id}/publish")
    public AudioDetailDto publish(@PathVariable long id) {
        return service.publish(id);
    }

    @PostMapping("/{id}/unpublish")
    public AudioDetailDto unpublish(@PathVariable long id) {
        return service.unpublish(id);
    }

    @PostMapping("/{id}/archive")
    public AudioDetailDto archive(@PathVariable long id) {
        return service.archive(id);
    }
}
