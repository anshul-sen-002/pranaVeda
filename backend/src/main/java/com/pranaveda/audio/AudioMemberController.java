package com.pranaveda.audio;

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
 * Member-only audio endpoints (agents.md 2.12): favorites and listening history.
 * All routes live under {@code /api/v1/me/**}, so the security chain requires
 * authentication and the service re-resolves the owner from the security
 * context - a member can only touch their own favorites/history. Public
 * browsing/streaming stays on {@link AudioController}.
 */
@Tag(name = "Audio library (member)")
@RestController
@RequestMapping("/api/v1/me/audio")
public class AudioMemberController {

    private final AudioMemberService audioMemberService;

    public AudioMemberController(AudioMemberService audioMemberService) {
        this.audioMemberService = audioMemberService;
    }

    /** Toggles a favorite (add if absent, remove if present). Idempotent. */
    @PostMapping("/favorites/{trackId}")
    public ResponseEntity<FavoriteStatusDto> toggleFavorite(@PathVariable long trackId) {
        return ResponseEntity.ok(audioMemberService.toggleFavorite(trackId));
    }

    /** Whether the caller has favorited a track (for UI state). */
    @GetMapping("/favorites/{trackId}")
    public FavoriteStatusDto favoriteStatus(@PathVariable long trackId) {
        boolean favorite = audioMemberService.isFavorite(trackId);
        return new FavoriteStatusDto(trackId, favorite, 0);
    }

    /** The caller's favorite tracks (published only), most-recent first. */
    @GetMapping("/favorites")
    public PageResponse<AudioTrackSummary> listFavorites(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return audioMemberService.listFavorites(page, size);
    }

    /** Records that the caller played a track (listening history). */
    @PostMapping("/history")
    public ResponseEntity<Void> recordListen(@Valid @RequestBody ListenRequest request) {
        audioMemberService.recordListen(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /** The caller's listening history, newest first. */
    @GetMapping("/history")
    public PageResponse<ListenHistoryDto> listHistory(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return audioMemberService.listHistory(page, size);
    }

    /** Clears a single history entry the caller owns. Idempotent. */
    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deleteHistoryEntry(@PathVariable long id) {
        audioMemberService.deleteHistoryEntry(id);
        return ResponseEntity.noContent().build();
    }

    /** Clears the caller's entire listening history. Idempotent. */
    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory() {
        audioMemberService.clearHistory();
        return ResponseEntity.noContent().build();
    }
}
