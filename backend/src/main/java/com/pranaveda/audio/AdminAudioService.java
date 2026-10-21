package com.pranaveda.audio;

import java.util.List;

import com.pranaveda.bookmark.BookmarkRepository;
import com.pranaveda.bookmark.BookmarkTarget;
import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.util.SlugUtil;
import com.pranaveda.media.MediaAsset;
import com.pranaveda.media.MediaKind;
import com.pranaveda.media.MediaRepository;
import com.pranaveda.media.MediaService;
import com.pranaveda.security.CurrentUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin audio studio: full track lifecycle (create/update/publish/unpublish/
 * archive/delete) plus media attachment. Asset ids are validated against our own
 * media_assets rows - kind-checked (AUDIO vs CONTENT_IMAGE) - so an admin
 * cannot attach a profile photo or a foreign object by guessing ids.
 */
@Service
public class AdminAudioService {

    private final AudioTrackRepository tracks;
    private final MediaRepository media;
    private final MediaService mediaService;
    private final AudioFavoriteRepository favorites;
    private final AudioListeningHistoryRepository history;
    private final BookmarkRepository bookmarks;

    public AdminAudioService(AudioTrackRepository tracks, MediaRepository media,
                             MediaService mediaService, AudioFavoriteRepository favorites,
                             AudioListeningHistoryRepository history, BookmarkRepository bookmarks) {
        this.tracks = tracks;
        this.media = media;
        this.mediaService = mediaService;
        this.favorites = favorites;
        this.history = history;
        this.bookmarks = bookmarks;
    }

    @Transactional(readOnly = true)
    public PageResponse<AudioDetailDto> list() {
        List<AudioTrack> all = tracks.findAllByOrderByCreatedAtDesc();
        // One extra query for every referenced audio/cover asset in the page.
        java.util.Set<Long> assetIds = new java.util.LinkedHashSet<>();
        for (AudioTrack track : all) {
            if (track.getAudioAssetId() != null) assetIds.add(track.getAudioAssetId());
            if (track.getCoverAssetId() != null) assetIds.add(track.getCoverAssetId());
        }
        java.util.Map<Long, MediaAsset> assets = assetIds.isEmpty()
                ? java.util.Map.of()
                : media.findAllById(assetIds).stream()
                        .collect(java.util.stream.Collectors.toMap(MediaAsset::getId, a -> a));
        return PageResponse.of(all.stream().map(t -> detail(t, assets)).toList(), 0, all.size(), all.size());
    }

    @Transactional(readOnly = true)
    public AudioDetailDto get(long id) {
        return detail(require(id));
    }

    @Transactional
    public AudioDetailDto create(@Valid AdminAudioRequest request) {
        AudioTrack track = new AudioTrack();
        track.setSlug(resolveNewSlug(request.slug(), request.title()));
        apply(track, request);
        track.setStatus(AudioStatus.DRAFT);
        track.setCreatedBy(CurrentUserPrincipal.requireCurrentUserId());
        return detail(tracks.save(track));
    }

    @Transactional
    public AudioDetailDto update(long id, @Valid AdminAudioRequest request) {
        AudioTrack track = require(id);
        String wanted = request.slug() == null || request.slug().isBlank()
                ? null : SlugUtil.slugify(request.slug());
        if (wanted != null && !wanted.isEmpty() && !wanted.equals(track.getSlug())
                && tracks.findBySlug(wanted).isPresent()) {
            throw new ConflictException("Another audio track already uses slug '" + wanted + "'.");
        }
        if (wanted != null && !wanted.isEmpty()) {
            track.setSlug(wanted);
        }
        apply(track, request);
        return detail(tracks.save(track));
    }

    @Transactional
    public AudioDetailDto unpublish(long id) {
        AudioTrack track = require(id);
        track.setStatus(AudioStatus.DRAFT);
        return detail(tracks.save(track));
    }

    @Transactional
    public AudioDetailDto archive(long id) {
        AudioTrack track = require(id);
        track.setStatus(AudioStatus.ARCHIVED);
        return detail(tracks.save(track));
    }

    /**
     * ADMIN: deletes a track and all of its stored media (agents.md 2.15
     * cleanup). The audio file and cover are removed from Cloudinary and the
     * {@code media_assets} rows, then the track row, and finally every member
     * reference (favorites, listening history, bookmarks) so no dangling id is
     * left behind. Cloudinary deletion is best-effort - a transient storage
     * failure still removes the DB rows so the platform never shows a ghost
     * track, and the operator is left a log line to reconcile.
     */
    @Transactional
    public void delete(long id) {
        AudioTrack track = require(id);
        // Remove stored objects + metadata first (audio file and cover art).
        if (track.getAudioAssetId() != null) {
            mediaService.deleteAdminAsset(track.getAudioAssetId());
        }
        if (track.getCoverAssetId() != null
                && !track.getCoverAssetId().equals(track.getAudioAssetId())) {
            mediaService.deleteAdminAsset(track.getCoverAssetId());
        }
        // Clear every member reference to this track so saved lists and history
        // never point at a deleted row.
        favorites.deleteByTrackId(id);
        history.deleteByTrackId(id);
        bookmarks.deleteByTargetTypeAndTargetId(BookmarkTarget.AUDIO, id);
        tracks.delete(track);
    }

    @Transactional
    public AudioDetailDto attachAudio(long id, long assetId) {
        AudioTrack track = require(id);
        MediaAsset asset = requireAsset(assetId, MediaKind.AUDIO);
        track.setAudioAssetId(asset.getId());
        if (asset.getDurationSecs() != null) {
            track.setDurationSecs((int) Math.round(asset.getDurationSecs()));
        }
        return detail(tracks.save(track));
    }

    @Transactional
    public AudioDetailDto attachCover(long id, long assetId) {
        AudioTrack track = require(id);
        MediaAsset asset = requireAsset(assetId, MediaKind.CONTENT_IMAGE);
        track.setCoverAssetId(asset.getId());
        return detail(tracks.save(track));
    }

    // --- internals ----------------------------------------------------------

    private AudioTrack require(long id) {
        return tracks.findById(id).orElseThrow(() -> new NotFoundException("Audio track not found."));
    }

    private MediaAsset requireAsset(long assetId, MediaKind kind) {
        MediaAsset asset = media.findById(assetId)
                .orElseThrow(() -> new NotFoundException("Media asset not found."));
        if (asset.getKind() != kind) {
            throw new BadRequestException("Asset " + assetId + " is " + asset.getKind()
                    + " but " + kind + " is required here.");
        }
        return asset;
    }

    private void apply(AudioTrack track, AdminAudioRequest request) {
        track.setTitle(request.title().trim());
        track.setDescription(blankToNull(request.description()));
        track.setCategory(request.category());
        track.setDurationSecs(request.durationSecs());
        track.setTags(request.tags());
        track.setStreamable(request.streamable());
        track.setDownloadable(request.downloadable());
        track.setCreator(blankToNull(request.creator()));
        track.setLicense(blankToNull(request.license()));
        track.setAttribution(blankToNull(request.attribution()));
        if (request.audioAssetId() != null) {
            MediaAsset audio = requireAsset(request.audioAssetId(), MediaKind.AUDIO);
            track.setAudioAssetId(audio.getId());
            if (audio.getDurationSecs() != null) {
                track.setDurationSecs((int) Math.round(audio.getDurationSecs()));
            }
        }
        if (request.coverAssetId() != null) {
            MediaAsset cover = requireAsset(request.coverAssetId(), MediaKind.CONTENT_IMAGE);
            track.setCoverAssetId(cover.getId());
        }
    }

    private String resolveNewSlug(String wanted, String title) {
        String base = (wanted == null || wanted.isBlank() ? title : wanted);
        String slug = SlugUtil.slugify(base == null ? "" : base);
        if (slug.isEmpty()) {
            slug = "track-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        String candidate = slug;
        int n = 2;
        while (tracks.findBySlug(candidate).isPresent()) {
            candidate = slug + "-" + (n++);
        }
        return candidate;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AudioDetailDto detail(AudioTrack track) {
        java.util.Map<Long, MediaAsset> assets = new java.util.HashMap<>();
        if (track.getAudioAssetId() != null) {
            media.findById(track.getAudioAssetId()).ifPresent(a -> assets.put(a.getId(), a));
        }
        if (track.getCoverAssetId() != null) {
            media.findById(track.getCoverAssetId()).ifPresent(a -> assets.put(a.getId(), a));
        }
        return detail(track, assets);
    }

    private AudioDetailDto detail(AudioTrack track, java.util.Map<Long, MediaAsset> assets) {
        MediaAsset cover = track.getCoverAssetId() == null ? null : assets.get(track.getCoverAssetId());
        MediaAsset audio = track.getAudioAssetId() == null ? null : assets.get(track.getAudioAssetId());
        String stream = (track.isStreamable() && audio != null) ? audio.getSecureUrl() : null;
        return new AudioDetailDto(track.getId(), track.getTitle(), track.getSlug(),
                track.getDescription(), track.getCategory(), track.getDurationSecs(),
                cover == null ? null : cover.getSecureUrl(), stream,
                track.isDownloadable(), splitTags(track.getTags()), track.getCreator(),
                track.getLicense(), track.getStatus(), track.getPublishedAt());
    }

    private static java.util.List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return java.util.List.of();
        }
        return java.util.Arrays.stream(tags.split(",")).map(String::trim)
                .filter(s -> !s.isEmpty()).toList();
    }

    public AudioDetailDto publish(long id) {
        AudioTrack track = require(id);
        if (track.getAudioAssetId() == null) {
            throw new BadRequestException("Attach an audio file before publishing.");
        }
        track.setStatus(AudioStatus.PUBLISHED);
        return detail(tracks.save(track));
    }

}
