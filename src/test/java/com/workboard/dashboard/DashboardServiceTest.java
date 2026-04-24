package com.workboard.dashboard;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryStatus;
import com.workboard.entry.EntryType;
import com.workboard.timelog.TimeLogEntity;
import com.workboard.timelog.TimeLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
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

    @Test
    void getDaily_putsFutureAndPastDueTasksIntoBacklogButNotTodayTasks() {
        LocalDate date = LocalDate.of(2026, 4, 24);
        LocalDate previousWorkday = LocalDate.of(2026, 4, 23);

        EntryEntity todayTask = new EntryEntity();
        todayTask.setId(1L);
        todayTask.setType(EntryType.TASK);
        todayTask.setTitle("Today task");
        todayTask.setStatus(EntryStatus.OPEN);
        todayTask.setDate(date);
        todayTask.setDueDate(date);
        todayTask.setCreatedAt(Instant.parse("2026-04-24T10:15:30Z"));
        todayTask.setUpdatedAt(Instant.parse("2026-04-24T10:15:30Z"));

        EntryEntity noDueDateTask = new EntryEntity();
        noDueDateTask.setId(2L);
        noDueDateTask.setType(EntryType.TASK);
        noDueDateTask.setTitle("Backlog without due date");
        noDueDateTask.setStatus(EntryStatus.OPEN);
        noDueDateTask.setDate(date.minusDays(1));
        noDueDateTask.setCreatedAt(Instant.parse("2026-04-24T09:15:30Z"));
        noDueDateTask.setUpdatedAt(Instant.parse("2026-04-24T09:15:30Z"));

        EntryEntity futureTask = new EntryEntity();
        futureTask.setId(3L);
        futureTask.setType(EntryType.TASK);
        futureTask.setTitle("Future backlog task");
        futureTask.setStatus(EntryStatus.IN_PROGRESS);
        futureTask.setDate(date);
        futureTask.setDueDate(date.plusDays(1));
        futureTask.setCreatedAt(Instant.parse("2026-04-24T08:15:30Z"));
        futureTask.setUpdatedAt(Instant.parse("2026-04-24T08:15:30Z"));

        EntryEntity pastTask = new EntryEntity();
        pastTask.setId(4L);
        pastTask.setType(EntryType.TASK);
        pastTask.setTitle("Past backlog task");
        pastTask.setStatus(EntryStatus.PAUSED);
        pastTask.setDate(date.minusDays(2));
        pastTask.setDueDate(date.minusDays(3));
        pastTask.setCreatedAt(Instant.parse("2026-04-24T07:15:30Z"));
        pastTask.setUpdatedAt(Instant.parse("2026-04-24T07:15:30Z"));

        EntryEntity previousDoneTask = new EntryEntity();
        previousDoneTask.setId(5L);
        previousDoneTask.setType(EntryType.TASK);
        previousDoneTask.setTitle("Yesterday done");
        previousDoneTask.setStatus(EntryStatus.DONE);
        previousDoneTask.setDate(previousWorkday);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)).thenReturn(List.of(todayTask));
        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(previousWorkday)).thenReturn(List.of(previousDoneTask));
        when(entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDesc(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)))
                .thenReturn(List.of(noDueDateTask, futureTask, pastTask, todayTask));
        when(entryRepository.findByTypeAndStatusOrderByCreatedAtDesc(EntryType.REMINDER, EntryStatus.OPEN))
                .thenReturn(List.of());
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        DailyResponse response = dashboardService.getDaily(date);

        assertThat(response.backlog())
                .extracting(entry -> entry.title())
                .containsExactly("Backlog without due date", "Future backlog task", "Past backlog task");
        assertThat(response.backlog())
                .extracting(entry -> entry.title())
                .doesNotContain("Today task");
    }
}
