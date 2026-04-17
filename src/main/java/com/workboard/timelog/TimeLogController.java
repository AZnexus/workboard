package com.workboard.timelog;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/timelogs")
public class TimeLogController {

    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @GetMapping
    public ResponseEntity<List<TimeLogResponse>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {

        List<TimeLogEntity> logs;
        if (date != null) {
            logs = timeLogService.findByDate(date);
        } else if (dateFrom != null && dateTo != null) {
            logs = timeLogService.findByDateRange(dateFrom, dateTo);
        } else {
            logs = timeLogService.findByDateRange(LocalDate.of(2000, 1, 1), LocalDate.of(9999, 12, 31));
        }

        return ResponseEntity.ok(logs.stream().map(TimeLogResponse::from).toList());
    }

    @GetMapping("/projects")
    public ResponseEntity<List<String>> distinctProjects() {
        return ResponseEntity.ok(timeLogService.findDistinctProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeLogResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(TimeLogResponse.from(timeLogService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<TimeLogResponse> create(@Valid @RequestBody CreateTimeLogRequest request) {
        TimeLogEntity created = timeLogService.create(request);
        URI location = URI.create("/api/v1/timelogs/" + created.getId());
        return ResponseEntity.created(location).body(TimeLogResponse.from(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TimeLogResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateTimeLogRequest request) {
        return ResponseEntity.ok(TimeLogResponse.from(timeLogService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        timeLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
