package com.workboard.improvement;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record CreateImprovementRequest(
        @NotBlank @Size(max = 200) String title,
        String requirements,
        String redmineParentRef,
        Integer priority,
        LocalDate dueDate,
        String jiraRef,
        Long versionId,
        List<Long> tagIds,
        Double soldHours,
        ImprovementStatus status,
        @NotNull Integer completionPercentage,
        @Valid ImprovementNoteRequest note
) {
    public CreateImprovementRequest {
        if (tagIds == null) {
            tagIds = new ArrayList<>();
        }
        if (status == null) {
            status = ImprovementStatus.NOVA;
        }
        if (completionPercentage == null) {
            completionPercentage = 0;
        }
        if (note == null) {
            note = new ImprovementNoteRequest(null, null, null);
        }
    }

    public record ImprovementNoteRequest(
            String context,
            String riskDependency,
            String observations
    ) {
    }
}
