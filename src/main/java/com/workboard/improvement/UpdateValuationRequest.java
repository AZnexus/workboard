package com.workboard.improvement;

import java.time.LocalDate;
import java.util.List;

public record UpdateValuationRequest(
        String derivedTitle,
        String redmineChildRef,
        LocalDate dueDate,
        ValuationStatus status,
        Integer completionPercentage,
        Integer priority,
        Long versionId,
        List<Long> tagIds,
        String textileBody,
        String structuredContentJson,
        Double analysisHours,
        Double totalEstimatedHours
) {
}
