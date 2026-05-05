package com.workboard.dashboard;

import com.workboard.entry.EntryStatus;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DashboardRulesTest {

    @Test
    void activeTaskStatuses_containsOpenInProgressAndPausedOnly() throws Exception {
        Class<?> dashboardRulesClass = Class.forName("com.workboard.dashboard.DashboardRules");
        Method activeTaskStatuses = dashboardRulesClass.getDeclaredMethod("activeTaskStatuses");
        activeTaskStatuses.setAccessible(true);

        @SuppressWarnings("unchecked")
        List<EntryStatus> statuses = (List<EntryStatus>) activeTaskStatuses.invoke(null);

        assertThat(statuses).containsExactly(
                EntryStatus.OPEN,
                EntryStatus.IN_PROGRESS,
                EntryStatus.PAUSED
        );
    }
}
