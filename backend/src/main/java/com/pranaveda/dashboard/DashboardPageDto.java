package com.pranaveda.dashboard;

import java.util.List;

import com.pranaveda.routine.RoutineSummaryDto;
import com.pranaveda.session.PracticeSessionDto;
import com.pranaveda.wellness.WellnessProfileDto;

/** All server data needed to render the member dashboard in one request. */
public record DashboardPageDto(
        DashboardDto dashboard,
        List<PracticeSessionDto> sessions,
        WellnessProfileDto wellness,
        List<RoutineSummaryDto> routines) {
}
