package com.workboard.dashboard;

import com.workboard.entry.EntryStatus;

import java.util.List;

final class DashboardRules {

    private static final List<EntryStatus> ACTIVE_TASK_STATUSES = List.of(
            EntryStatus.OPEN,
            EntryStatus.IN_PROGRESS,
            EntryStatus.PAUSED
    );

    private DashboardRules() {
    }

    static List<EntryStatus> activeTaskStatuses() {
        return ACTIVE_TASK_STATUSES;
    }
}
