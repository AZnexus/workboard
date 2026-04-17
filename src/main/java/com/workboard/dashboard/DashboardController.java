package com.workboard.dashboard;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyResponse> daily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(dashboardService.getDaily(date != null ? date : LocalDate.now()));
    }

    @GetMapping("/standup")
    public ResponseEntity<StandupResponse> standup() {
        return ResponseEntity.ok(dashboardService.getStandup());
    }

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyResponse> weekly(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        LocalDate start = weekStart != null ? weekStart : LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        return ResponseEntity.ok(dashboardService.getWeekly(start));
    }
}
