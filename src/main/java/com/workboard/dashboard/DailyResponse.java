package com.workboard.dashboard;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.workboard.entry.EntryResponse;
import com.workboard.timelog.TimeLogResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@JsonNaming(SnakeCaseStrategy.class)
public record DailyResponse(
        LocalDate date,
        List<EntryResponse> entries,
        List<EntryResponse> pinned,
        List<TimeLogResponse> timeLogs,
        BigDecimal totalHours
) {}
