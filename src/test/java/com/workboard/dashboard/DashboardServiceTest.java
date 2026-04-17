package com.workboard.dashboard;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryStatus;
import com.workboard.timelog.TimeLogEntity;
import com.workboard.timelog.TimeLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private EntryRepository entryRepository;

    @Mock
    private TimeLogRepository timeLogRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getDaily_returnsEntriesAndTimeLogs() {
        LocalDate date = LocalDate.of(2026, 4, 17);

        EntryEntity entry = new EntryEntity();
        entry.setId(1L);
        entry.setTitle("Test entry");
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(date);

        TimeLogEntity log = new TimeLogEntity();
        log.setId(1L);
        log.setDate(date);
        log.setHours(new BigDecimal("3.0"));
        log.setProject("ProjectX");

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of(log));

        DailyResponse response = dashboardService.getDaily(date);

        assertThat(response.date()).isEqualTo(date);
        assertThat(response.entries()).hasSize(1);
        assertThat(response.timeLogs()).hasSize(1);
        assertThat(response.totalHours()).isEqualByComparingTo(new BigDecimal("3.0"));
    }

    @Test
    void getStandup_returnsDoneAndPlanEntries() {
        LocalDate today = LocalDate.now();
        LocalDate prev = today.minusDays(1);
        while (prev.getDayOfWeek().getValue() > 5) {
            prev = prev.minusDays(1);
        }
        final LocalDate yesterday = prev;

        EntryEntity doneEntry = new EntryEntity();
        doneEntry.setId(2L);
        doneEntry.setTitle("Done task");
        doneEntry.setStatus(EntryStatus.DONE);
        doneEntry.setDate(yesterday);

        EntryEntity openEntry = new EntryEntity();
        openEntry.setId(3L);
        openEntry.setTitle("Open task");
        openEntry.setStatus(EntryStatus.OPEN);
        openEntry.setDate(today);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(any())).thenAnswer(inv -> {
            LocalDate d = inv.getArgument(0);
            if (d.equals(yesterday)) return List.of(doneEntry);
            if (d.equals(today)) return List.of(openEntry);
            return List.of();
        });

        StandupResponse response = dashboardService.getStandup();

        assertThat(response.yesterdayDone()).hasSize(1);
        assertThat(response.yesterdayDone().get(0).title()).isEqualTo("Done task");
        assertThat(response.todayPlan()).hasSize(1);
        assertThat(response.todayPlan().get(0).title()).isEqualTo("Open task");
    }
}
