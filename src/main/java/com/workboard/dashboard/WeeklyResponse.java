package com.workboard.dashboard;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.util.Map;

@JsonNaming(SnakeCaseStrategy.class)
public record WeeklyResponse(
        String week,
        Map<String, BigDecimal> hoursByProject,
        BigDecimal totalHours
) {}
