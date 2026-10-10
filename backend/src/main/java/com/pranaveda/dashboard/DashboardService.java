package com.pranaveda.dashboard;

import java.util.List;

import com.pranaveda.bookmark.SavedItemDto;
import com.pranaveda.bookmark.BookmarkService;
import com.pranaveda.challenge.ChallengeProgressDto;
import com.pranaveda.challenge.ChallengeService;
import com.pranaveda.session.PracticeStatsDto;
import com.pranaveda.session.PracticeSessionService;
import com.pranaveda.streak.StreakDto;
import com.pranaveda.streak.StreakService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds the member dashboard payload (agents.md 2.9) by composing the
 * already owner-scoped feature services. This class owns no queries of its own
 * beyond reading the composed results - it simply assembles one response so the
 * dashboard loads in a single round-trip.
 *
 * <p>All composed services re-resolve the owner from the security context, so
 * this endpoint can never leak another member's data (IDOR rule). The figures
 * are activity summaries only - no health claims, no implied causation.
 */
@Service
public class DashboardService {

    /** How many recently-saved items to include in the dashboard preview. */
    private static final int RECENT_SAVED_SIZE = 6;

    private final StreakService streakService;
    private final PracticeSessionService practiceSessionService;
    private final BookmarkService bookmarkService;
    private final ChallengeService challengeService;

    public DashboardService(StreakService streakService,
                            PracticeSessionService practiceSessionService,
                            BookmarkService bookmarkService,
                            ChallengeService challengeService) {
        this.streakService = streakService;
        this.practiceSessionService = practiceSessionService;
        this.bookmarkService = bookmarkService;
        this.challengeService = challengeService;
    }

    /**
     * The caller's dashboard: streak, practice totals, saved count, challenge
     * progress, and a preview of the most recently saved items.
     */
    @Transactional(readOnly = true)
    public DashboardDto get() {
        StreakDto streak = streakService.current();
        PracticeStatsDto practice = practiceSessionService.stats();
        long savedCount = bookmarkService.countMine();
        List<ChallengeProgressDto> challenges = challengeService.myParticipations();

        List<SavedItemDto> recentSaved = bookmarkService
                .list(null, null, "newest", 0, RECENT_SAVED_SIZE)
                .content();

        return new DashboardDto(streak, practice, savedCount, challenges, recentSaved);
    }
}
