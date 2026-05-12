package com.workboard.improvement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateValuationRequest(
        @NotBlank String redmineChildRef,
        @NotNull LocalDate dueDate,
        Integer priority,
        String textileBody,
        String structuredContentJson,
        Double analysisHours,
        Double totalEstimatedHours
) {
}
