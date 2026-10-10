package com.pranaveda.audio;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.media.MediaAsset;
import com.pranaveda.media.MediaRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Calm-music library (agents.md 2.12). Public readers see only PUBLISHED tracks;
 * drafts and archived tracks do not exist as far as the public API is concerned.
 *
 * <p>Stream and cover URLs are resolved from the referenced media assets in one
 * extra query per page (not per row), and the stream URL is only returned for
 * tracks marked streamable. Download is a separate, member-only permission that
 * this service merely advertises via {@code downloadable} - enforcement lives in
 * the media download endpoint.
 */
@Service
public class AudioService {

    private static final int MAX_PAGE_SIZE = 50;

    private final AudioTrackRepository tracks;
    private final MediaRepository media;

    public AudioService(AudioTrackRepository tracks, MediaRepository media) {
        this.tracks = tracks;
        this.media = media;
    }

    /** Published track list, newest first, with resolved stream/cover URLs. */
    @Transactional(readOnly = true)
    public PageResponse<AudioTrackSummary> list(int page, int size) {
        var result = tracks.findPublished(PageRequest.of(clampPage(page), clampSize(size)));
        return PageResponse.of(
                summaries(result.getContent(), assetsFor(result.getContent())),
                result.getNumber(), result.getSize(), result.getTotalElements());
    }

    /** Published tracks in a category, newest first. */
    @Transactional(readOnly = true)
    public PageResponse<AudioTrackSummary> listByCategory(AudioCategory category, int page, int size) {
        var result = tracks.findPublishedByCategory(
                category, PageRequest.of(clampPage(page), clampSize(size)));
        return PageResponse.of(
                summaries(result.getContent(), assetsFor(result.getContent())),
                result.getNumber(), result.getSize(), result.getTotalElements());
    }

    /** A single published track by slug with full detail, or 404 (never leaks drafts). */
    @Transactional(readOnly = true)
    public AudioDetailDto bySlug(String slug) {
        AudioTrack track = tracks.findPublishedBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Audio track not found."));
        Map<Long, MediaAsset> assets = assetsFor(List.of(track));
        return detail(track, assets);
    }

    // --- helpers -----------------------------------------------------------

    private List<AudioTrackSummary> summaries(List<AudioTrack> content, Map<Long, MediaAsset> assets) {
        return content.stream().map(track -> summary(track, assets)).toList();
    }

    /** Collects every referenced audio/cover asset for a page in one query. */
    private Map<Long, MediaAsset> assetsFor(List<AudioTrack> content) {
        Set<Long> ids = content.stream()
                .flatMap(track -> java.util.stream.Stream.of(track.getAudioAssetId(), track.getCoverAssetId()))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        return media.findAllById(ids).stream()
                .collect(Collectors.toMap(MediaAsset::getId, asset -> asset));
    }

    private static AudioTrackSummary summary(AudioTrack track, Map<Long, MediaAsset> assets) {
        MediaAsset cover = track.getCoverAssetId() == null ? null : assets.get(track.getCoverAssetId());
        return new AudioTrackSummary(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                track.getCategory(),
                track.getDurationSecs(),
                cover == null ? null : cover.getSecureUrl(),
                splitTags(track.getTags()),
                track.getPublishedAt());
    }

    private static AudioDetailDto detail(AudioTrack track, Map<Long, MediaAsset> assets) {
        MediaAsset audio = track.getAudioAssetId() == null ? null : assets.get(track.getAudioAssetId());
        MediaAsset cover = track.getCoverAssetId() == null ? null : assets.get(track.getCoverAssetId());
        // Only expose a playable URL when the track is streamable and the asset exists.
        String streamUrl = (track.isStreamable() && audio != null) ? audio.getSecureUrl() : null;
        return new AudioDetailDto(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                track.getCategory(),
                track.getDurationSecs(),
                cover == null ? null : cover.getSecureUrl(),
                streamUrl,
                track.isDownloadable(),
                splitTags(track.getTags()),
                track.getCreator(),
                track.getLicense(),
                track.getPublishedAt());
    }

    private static List<String> splitTags(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .toList();
    }

    private static int clampPage(int page) {
        return Math.max(0, page);
    }

    private static int clampSize(int size) {
        return Math.min(Math.max(1, size), MAX_PAGE_SIZE);
    }
}

