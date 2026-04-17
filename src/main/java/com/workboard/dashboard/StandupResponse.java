package com.workboard.dashboard;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.workboard.entry.EntryResponse;

import java.time.LocalDate;
import java.util.List;

@JsonNaming(SnakeCaseStrategy.class)
public record StandupResponse(
        LocalDate yesterday,
        LocalDate today,
        List<EntryResponse> yesterdayDone,
        List<EntryResponse> todayPlan
) {}
