package com.workboard.dashboard;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryResponse;
import com.workboard.entry.EntryStatus;
import com.workboard.entry.EntryType;
import com.workboard.timelog.TimeLogEntity;
import com.workboard.timelog.TimeLogRepository;
import com.workboard.timelog.TimeLogResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
public class DashboardService {

    private final EntryRepository entryRepository;
    private final TimeLogRepository timeLogRepository;

    public DashboardService(EntryRepository entryRepository, TimeLogRepository timeLogRepository) {
        this.entryRepository = entryRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @Transactional(readOnly = true)
    public DailyResponse getDaily(LocalDate date) {
        List<EntryEntity> datedEntries = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date);
        List<EntryStatus> activeTaskStatuses = Arrays.asList(
                EntryStatus.OPEN,
                EntryStatus.IN_PROGRESS,
                EntryStatus.PAUSED);
        List<EntryEntity> activeTasks = entryRepository
                .findByTypeAndStatusInOrderByPriorityAscCreatedAtDesc(EntryType.TASK, activeTaskStatuses);

        List<EntryResponse> entries = Stream.concat(
                        datedEntries.stream()
                                .filter(entry -> entry.getType() != EntryType.TASK),
                        activeTasks.stream()
                                .filter(EntryEntity::isScheduledToday))
                .distinct()
                .map(EntryResponse::from)
                .toList();
        List<EntryResponse> pinned = datedEntries.stream()
                .filter(EntryEntity::isPinned)
                .map(EntryResponse::from)
                .toList();

        List<TimeLogEntity> logs = timeLogRepository.findByDate(date);
        List<TimeLogResponse> timeLogResponses = logs.stream().map(TimeLogResponse::from).toList();
        BigDecimal totalHours = logs.stream()
                .map(TimeLogEntity::getHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate yesterday = previousWorkday(date);
        List<EntryResponse> yesterdayDone = entryRepository
                .findByDateOrderByPinnedDescCreatedAtDesc(yesterday).stream()
                .filter(e -> e.getStatus() == EntryStatus.DONE)
                .map(EntryResponse::from)
                .toList();

        List<EntryResponse> backlog = activeTasks
                .stream()
                .filter(entry -> !entry.isScheduledToday())
                .map(EntryResponse::from)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));

        backlog.sort((a, b) -> {
            Integer leftPriority = a.priority() != null ? a.priority() : Integer.MAX_VALUE;
            Integer rightPriority = b.priority() != null ? b.priority() : Integer.MAX_VALUE;
            int priorityCompare = leftPriority.compareTo(rightPriority);
            if (priorityCompare != 0) {
                return priorityCompare;
            }

            return b.createdAt().compareTo(a.createdAt());
        });

        List<EntryResponse> reminders = entryRepository
                .findByTypeAndStatusOrderByCreatedAtDesc(EntryType.REMINDER, EntryStatus.OPEN)
                .stream()
                .map(EntryResponse::from)
                .toList();

        return new DailyResponse(date, entries, pinned, timeLogResponses, totalHours, yesterdayDone, backlog, reminders);
    }

    @Transactional(readOnly = true)
    public StandupResponse getStandup() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = previousWorkday(today);
        List<EntryStatus> activeTaskStatuses = Arrays.asList(
                EntryStatus.OPEN,
                EntryStatus.IN_PROGRESS,
                EntryStatus.PAUSED);

        List<EntryEntity> yesterdayEntries = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(yesterday);
        List<EntryEntity> activeTasks = entryRepository
                .findByTypeAndStatusInOrderByPriorityAscCreatedAtDesc(EntryType.TASK, activeTaskStatuses);

        List<EntryResponse> yesterdayDone = yesterdayEntries.stream()
                .filter(e -> e.getStatus() == EntryStatus.DONE)
                .map(EntryResponse::from)
                .toList();
        List<EntryResponse> todayPlan = activeTasks.stream()
                .filter(EntryEntity::isScheduledToday)
                .map(EntryResponse::from)
                .toList();

        return new StandupResponse(yesterday, today, yesterdayDone, todayPlan);
    }

    @Transactional(readOnly = true)
    public WeeklyResponse getWeekly(LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        String week = weekStart + "/" + weekEnd;

        List<Object[]> rows = timeLogRepository.sumHoursByProjectBetween(weekStart, weekEnd);
        Map<String, BigDecimal> hoursByProject = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Object[] row : rows) {
            String project = (String) row[0];
            BigDecimal hours = (BigDecimal) row[1];
            hoursByProject.put(project, hours);
            total = total.add(hours);
        }

        return new WeeklyResponse(week, hoursByProject, total);
    }

    private LocalDate previousWorkday(LocalDate date) {
        LocalDate prev = date.minusDays(1);
        while (prev.getDayOfWeek() == DayOfWeek.SATURDAY || prev.getDayOfWeek() == DayOfWeek.SUNDAY) {
            prev = prev.minusDays(1);
        }
        return prev;
    }
}
