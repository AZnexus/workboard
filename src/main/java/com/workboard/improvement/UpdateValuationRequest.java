package com.workboard.improvement;

import java.time.LocalDate;

public record UpdateValuationRequest(
        String redmineChildRef,
        LocalDate dueDate,
        ValuationStatus status,
        Integer completionPercentage,
        Integer priority,
        String textileBody,
        String structuredContentJson,
        Double analysisHours,
        Double totalEstimatedHours
) {
}
