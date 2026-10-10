package com.pranaveda.audio;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.media.MediaAsset;
import com.pranaveda.media.MediaRepository;
import com.pranaveda.security.CurrentUserPrincipal;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Member audio features (agents.md 2.12): favorites and listening history.
 *
 * <p>Every method resolves the owner from the security context - a member can
 * only ever read or mutate their own favorites/history. Client input is treated
 * as untrusted: the referenced track must be published to count, and reported
 * listen durations are clamped so history cannot be poisoned.
 */
@Service
public class AudioMemberService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_LISTEN_SECONDS = 24 * 60 * 60; // one day

    private final AudioFavoriteRepository favorites;
    private final AudioListeningHistoryRepository history;
    private final AudioTrackRepository tracks;
    private final MediaRepository media;

    public AudioMemberService(AudioFavoriteRepository favorites,
                              AudioListeningHistoryRepository history,
                              AudioTrackRepository tracks,
                              MediaRepository media) {
        this.favorites = favorites;
        this.history = history;
        this.tracks = tracks;
        this.media = media;
    }

    /**
     * Toggles a favorite: adds it if absent, removes it if present. Idempotent
     * at the data layer via the unique (user, track) constraint. The track must
     * be published; a draft/archived/unknown track cannot be favorited.
     */
    @Transactional
    public FavoriteStatusDto toggleFavorite(long trackId) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        requirePublishedTrack(trackId);

        boolean nowFavorite;
        var existing = favorites.findByUserIdAndTrackId(userId, trackId);
        if (existing.isPresent()) {
            favorites.deleteByUserIdAndTrackId(userId, trackId);
            nowFavorite = false;
        } else {
            AudioFavorite favorite = new AudioFavorite();
            favorite.setUserId(userId);
            favorite.setTrackId(trackId);
            favorites.save(favorite);
            nowFavorite = true;
        }
        return new FavoriteStatusDto(trackId, nowFavorite, favorites.countByUserId(userId));
    }

    /** Whether the caller has favorited this track (for UI state). */
    @Transactional(readOnly = true)
    public boolean isFavorite(long trackId) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return favorites.existsByUserIdAndTrackId(userId, trackId);
    }

    /**
     * Records that the member played a track (agents.md 2.12 "listening history").
     * The track must be published; the reported seconds are clamped so a client
     * cannot poison history with a nonsense value.
     */
    @Transactional
    public void recordListen(ListenRequest request) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        requirePublishedTrack(request.trackId());

        AudioListeningHistory entry = new AudioListeningHistory();
        entry.setUserId(userId);
        entry.setTrackId(request.trackId());
        entry.setSecondsListened(clampSeconds(request.secondsListened()));
        entry.setPlayedAt(Instant.now());
        history.save(entry);
    }

    /** The member's favorite tracks (published only), most-recent first. */
    @Transactional(readOnly = true)
    public PageResponse<AudioTrackSummary> listFavorites(int page, int size) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        var favoritesPage = favorites.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(clampPage(page), clampSize(size)));

        List<AudioTrack> tracks = publishedTracks(trackIds(favoritesPage.getContent()));
        Map<Long, AudioTrack> byId = tracks.stream()
                .collect(Collectors.toMap(AudioTrack::getId, t -> t));
        Map<Long, MediaAsset> assets = coverAssets(tracks);

        // Preserve favorite recency order, dropping any since-unpublished track.
        List<AudioTrackSummary> content = favoritesPage.getContent().stream()
                .map(favorite -> byId.get(favorite.getTrackId()))
                .filter(Objects::nonNull)
                .map(track -> summary(track, assets))
                .toList();
        return PageResponse.of(content, favoritesPage.getNumber(),
                favoritesPage.getSize(), favoritesPage.getTotalElements());
    }

    /** The member's listening history, newest first, with best-effort metadata. */
    @Transactional(readOnly = true)
    public PageResponse<ListenHistoryDto> listHistory(int page, int size) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        var historyPage = history.findByUserIdOrderByPlayedAtDesc(
                userId, PageRequest.of(clampPage(page), clampSize(size)));

        Set<Long> ids = historyPage.getContent().stream()
                .map(AudioListeningHistory::getTrackId)
                .collect(Collectors.toSet());
        Map<Long, AudioTrack> trackMap = ids.isEmpty() ? Map.of()
                : tracks.findAllById(ids).stream()
                        .collect(Collectors.toMap(AudioTrack::getId, t -> t));
        Map<Long, MediaAsset> assets = coverAssets(trackMap.values());

        List<ListenHistoryDto> content = historyPage.getContent().stream()
                .map(entry -> historyDto(entry, trackMap.get(entry.getTrackId()), assets))
                .toList();
        return PageResponse.of(content, historyPage.getNumber(),
                historyPage.getSize(), historyPage.getTotalElements());
    }

    /** Clears a single history entry the caller owns. Idempotent. */
    @Transactional
    public void deleteHistoryEntry(long id) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        history.deleteByIdAndUserId(id, userId);
    }

    /** Clears the caller's entire listening history. Idempotent. */
    @Transactional
    public void clearHistory() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        history.deleteByUserId(userId);
    }


    // --- helpers -----------------------------------------------------------

    private AudioTrack requirePublishedTrack(long trackId) {
        AudioTrack track = tracks.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Audio track not found."));
        if (track.getStatus() != AudioStatus.PUBLISHED) {
            throw new BadRequestException("Audio track is not available.");
        }
        return track;
    }

    private List<AudioTrack> publishedTracks(List<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        return tracks.findAllById(ids).stream()
                .filter(track -> track.getStatus() == AudioStatus.PUBLISHED)
                .toList();
    }

    private static List<Long> trackIds(List<AudioFavorite> favoritesList) {
        return favoritesList.stream().map(AudioFavorite::getTrackId).distinct().toList();
    }

    private Map<Long, MediaAsset> coverAssets(Collection<AudioTrack> trackList) {
        Set<Long> ids = trackList.stream()
                .map(AudioTrack::getCoverAssetId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        return media.findAllById(ids).stream()
                .collect(Collectors.toMap(MediaAsset::getId, asset -> asset));
    }

    private static AudioTrackSummary summary(AudioTrack track, Map<Long, MediaAsset> assets) {
        MediaAsset cover = track.getCoverAssetId() == null ? null : assets.get(track.getCoverAssetId());
        return new AudioTrackSummary(
                track.getId(), track.getTitle(), track.getSlug(), track.getDescription(),
                track.getCategory(), track.getDurationSecs(),
                cover == null ? null : cover.getSecureUrl(),
                splitTags(track.getTags()), track.getPublishedAt());
    }

    private static ListenHistoryDto historyDto(AudioListeningHistory entry,
                                               AudioTrack track, Map<Long, MediaAsset> assets) {
        if (track == null) {
            return new ListenHistoryDto(entry.getId(), entry.getTrackId(), null, null, null,
                    entry.getSecondsListened(), entry.getPlayedAt());
        }
        MediaAsset cover = track.getCoverAssetId() == null ? null : assets.get(track.getCoverAssetId());
        return new ListenHistoryDto(entry.getId(), entry.getTrackId(), track.getTitle(), track.getSlug(),
                cover == null ? null : cover.getSecureUrl(),
                entry.getSecondsListened(), entry.getPlayedAt());
    }

    private static List<String> splitTags(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(raw.split(","))
                .map(String::trim).filter(tag -> !tag.isEmpty()).toList();
    }

    private static Integer clampSeconds(Integer seconds) {
        if (seconds == null || seconds <= 0) {
            return null;
        }
        return Math.min(seconds, MAX_LISTEN_SECONDS);
    }

    private static int clampPage(int page) {
        return Math.max(0, page);
    }

    private static int clampSize(int size) {
        return Math.min(Math.max(1, size), MAX_PAGE_SIZE);
    }
}

