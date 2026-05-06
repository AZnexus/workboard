package com.workboard.dashboard;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryResponse;
import com.workboard.entry.EntryStatus;
import com.workboard.entry.EntryType;
import com.workboard.tag.TagEntity;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of(entry));
        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date.minusDays(1))).thenReturn(List.of());
        when(entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)))
                .thenReturn(List.of());
        when(entryRepository.findByTypeAndStatusOrderByCreatedAtDescWithTags(EntryType.REMINDER, EntryStatus.OPEN))
                .thenReturn(List.of());
        when(timeLogRepository.findByDate(date)).thenReturn(List.of(log));

        DailyResponse response = dashboardService.getDaily(date);

        assertThat(response.date()).isEqualTo(date);
        assertThat(response.entries()).hasSize(1);
        assertThat(response.timeLogs()).hasSize(1);
        assertThat(response.totalHours()).isEqualByComparingTo(new BigDecimal("3.0"));
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(date);
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(date);
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
        openEntry.setType(EntryType.TASK);
        openEntry.setStatus(EntryStatus.OPEN);
        openEntry.setDate(today);
        openEntry.setScheduledToday(true);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(any())).thenAnswer(inv -> {
            LocalDate d = inv.getArgument(0);
            if (d.equals(yesterday)) return List.of(doneEntry);
            if (d.equals(today)) return List.of(openEntry);
            return List.of();
        });
        when(entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)))
                .thenReturn(List.of(openEntry));

        StandupResponse response = dashboardService.getStandup();

        assertThat(response.yesterdayDone()).hasSize(1);
        assertThat(response.yesterdayDone().get(0).title()).isEqualTo("Done task");
        assertThat(response.todayPlan()).hasSize(1);
        assertThat(response.todayPlan().get(0).title()).isEqualTo("Open task");
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(yesterday);
        verify(entryRepository).findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED));
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(any());
        verify(entryRepository, never()).findByTypeAndStatusInOrderByPriorityAscCreatedAtDesc(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED));
    }

    @Test
    void getStandup_usesScheduledTodayForTodayPlan() {
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

        EntryEntity scheduledTask = new EntryEntity();
        scheduledTask.setId(3L);
        scheduledTask.setType(EntryType.TASK);
        scheduledTask.setTitle("Scheduled task");
        scheduledTask.setStatus(EntryStatus.OPEN);
        scheduledTask.setDate(today.minusDays(2));
        scheduledTask.setScheduledToday(true);

        EntryEntity datedButUnscheduledTask = new EntryEntity();
        datedButUnscheduledTask.setId(4L);
        datedButUnscheduledTask.setType(EntryType.TASK);
        datedButUnscheduledTask.setTitle("Dated but unscheduled");
        datedButUnscheduledTask.setStatus(EntryStatus.OPEN);
        datedButUnscheduledTask.setDate(today);
        datedButUnscheduledTask.setScheduledToday(false);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(any())).thenAnswer(inv -> {
            LocalDate d = inv.getArgument(0);
            if (d.equals(yesterday)) return List.of(doneEntry);
            if (d.equals(today)) return List.of(datedButUnscheduledTask);
            return List.of();
        });
        when(entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)))
                .thenReturn(List.of(scheduledTask, datedButUnscheduledTask));

        StandupResponse response = dashboardService.getStandup();

        assertThat(response.yesterdayDone()).hasSize(1);
        assertThat(response.todayPlan())
                .extracting(EntryResponse::title)
                .containsExactly("Scheduled task");
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

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of());
        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(previousWorkday)).thenReturn(List.of(previousDoneTask));
        when(entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)))
                .thenReturn(List.of(noDueDateTask, futureTask, pastTask));
        when(entryRepository.findByTypeAndStatusOrderByCreatedAtDescWithTags(EntryType.REMINDER, EntryStatus.OPEN))
                .thenReturn(List.of());
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        DailyResponse response = dashboardService.getDaily(date);

        assertThat(response.backlog())
                .extracting(entry -> entry.title())
                .containsExactly("Backlog without due date", "Future backlog task", "Past backlog task");
    }

    @Test
    void getDaily_usesScheduledTodayInsteadOfDueDateForTodayEntries() {
        LocalDate date = LocalDate.of(2026, 4, 24);

        EntryEntity scheduledTodayTask = new EntryEntity();
        scheduledTodayTask.setId(6L);
        scheduledTodayTask.setType(EntryType.TASK);
        scheduledTodayTask.setTitle("Scheduled today task");
        scheduledTodayTask.setStatus(EntryStatus.OPEN);
        scheduledTodayTask.setDate(date.minusDays(2));
        scheduledTodayTask.setDueDate(date.plusDays(5));
        scheduledTodayTask.setScheduledToday(true);
        scheduledTodayTask.setCreatedAt(Instant.parse("2026-04-24T06:15:30Z"));
        scheduledTodayTask.setUpdatedAt(Instant.parse("2026-04-24T06:15:30Z"));

        EntryEntity unscheduledTask = new EntryEntity();
        unscheduledTask.setId(7L);
        unscheduledTask.setType(EntryType.TASK);
        unscheduledTask.setTitle("Unscheduled task");
        unscheduledTask.setStatus(EntryStatus.OPEN);
        unscheduledTask.setDate(date.minusDays(1));
        unscheduledTask.setDueDate(date);
        unscheduledTask.setScheduledToday(false);
        unscheduledTask.setCreatedAt(Instant.parse("2026-04-24T05:15:30Z"));
        unscheduledTask.setUpdatedAt(Instant.parse("2026-04-24T05:15:30Z"));

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of());
        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date.minusDays(1))).thenReturn(List.of());
        when(entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)))
                .thenReturn(List.of(scheduledTodayTask, unscheduledTask));
        when(entryRepository.findByTypeAndStatusOrderByCreatedAtDescWithTags(EntryType.REMINDER, EntryStatus.OPEN))
                .thenReturn(List.of());
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        DailyResponse response = dashboardService.getDaily(date);

        assertThat(response.entries())
                .extracting(EntryResponse::title)
                .containsExactly("Scheduled today task");
        assertThat(response.backlog())
                .extracting(EntryResponse::title)
                .containsExactly("Unscheduled task");
    }

    @Test
    void getDaily_preservesTagsInMappedEntryResponses() {
        LocalDate date = LocalDate.of(2026, 4, 24);

        EntryEntity note = new EntryEntity();
        note.setId(8L);
        note.setType(EntryType.NOTE);
        note.setTitle("Tagged note");
        note.setStatus(EntryStatus.OPEN);
        note.setDate(date);

        TagEntity tag = new TagEntity();
        tag.setId(3L);
        tag.setName("backend");
        tag.setColor("#123456");
        note.addTag(tag);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of(note));
        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(LocalDate.of(2026, 4, 23))).thenReturn(List.of());
        when(entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)))
                .thenReturn(List.of());
        when(entryRepository.findByTypeAndStatusOrderByCreatedAtDescWithTags(EntryType.REMINDER, EntryStatus.OPEN))
                .thenReturn(List.of());
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        DailyResponse response = dashboardService.getDaily(date);

        assertThat(response.entries()).hasSize(1);
        assertThat(response.entries().get(0).tags()).hasSize(1);
        assertThat(response.entries().get(0).tags().get(0).name()).isEqualTo("backend");
        assertThat(response.entries().get(0).tags().get(0).color()).isEqualTo("#123456");
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(date);
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(date);
    }
}
