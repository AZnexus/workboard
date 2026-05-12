package com.workboard.improvement;

public record UpdateValuationRequest(
        ValuationStatus status,
        Integer completionPercentage,
        Integer priority,
        String textileBody,
        String structuredContentJson,
        Double analysisHours,
        Double totalEstimatedHours
) {
}
