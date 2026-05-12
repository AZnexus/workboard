package com.workboard.improvement;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UpdateImprovementRequest(
        @Size(max = 200) String title,
        String requirements,
        String redmineParentRef,
        Integer priority,
        LocalDate dueDate,
        String jiraRef,
        Long versionId,
        List<Long> tagIds,
        Double soldHours,
        ImprovementStatus status,
        Integer completionPercentage,
        @Valid ImprovementNoteRequest note
) {
    public record ImprovementNoteRequest(
            String context,
            String riskDependency,
            String observations
    ) {
    }
}
