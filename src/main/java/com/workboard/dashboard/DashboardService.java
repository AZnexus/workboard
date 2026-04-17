package com.workboard.dashboard;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryResponse;
import com.workboard.entry.EntryStatus;
import com.workboard.timelog.TimeLogEntity;
import com.workboard.timelog.TimeLogRepository;
import com.workboard.timelog.TimeLogResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
        List<EntryEntity> allEntries = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date);
        List<EntryResponse> entries = allEntries.stream().map(EntryResponse::from).toList();
        List<EntryResponse> pinned = allEntries.stream()
                .filter(EntryEntity::isPinned)
                .map(EntryResponse::from)
                .toList();

        List<TimeLogEntity> logs = timeLogRepository.findByDate(date);
        List<TimeLogResponse> timeLogResponses = logs.stream().map(TimeLogResponse::from).toList();
        BigDecimal totalHours = logs.stream()
                .map(TimeLogEntity::getHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DailyResponse(date, entries, pinned, timeLogResponses, totalHours);
    }

    @Transactional(readOnly = true)
    public StandupResponse getStandup() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = previousWorkday(today);

        List<EntryEntity> yesterdayEntries = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(yesterday);
        List<EntryEntity> todayEntries = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(today);

        List<EntryResponse> yesterdayAll = yesterdayEntries.stream().map(EntryResponse::from).toList();
        List<EntryResponse> todayAll = todayEntries.stream().map(EntryResponse::from).toList();
        List<EntryResponse> yesterdayDone = yesterdayEntries.stream()
                .filter(e -> e.getStatus() == EntryStatus.DONE)
                .map(EntryResponse::from)
                .toList();
        List<EntryResponse> todayPlan = todayEntries.stream()
                .filter(e -> e.getStatus() == EntryStatus.OPEN || e.getStatus() == EntryStatus.IN_PROGRESS)
                .map(EntryResponse::from)
                .toList();

        return new StandupResponse(yesterdayAll, todayAll, yesterdayDone, todayPlan);
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
