package com.workboard.improvement;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.workboard.tag.TagResponse;
import com.workboard.version.VersionResponse;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@JsonNaming(SnakeCaseStrategy.class)
public record ImprovementResponse(
        Long id,
        String title,
        String requirements,
        String redmineParentRef,
        Integer priority,
        LocalDate dueDate,
        String jiraRef,
        VersionResponse version,
        List<TagResponse> tags,
        Double soldHours,
        ImprovementStatus status,
        Integer completionPercentage,
        ImprovementNote note,
        ValuationSummary valuationSummary,
        Instant createdAt,
        Instant updatedAt
) {
    @JsonNaming(SnakeCaseStrategy.class)
    public record ImprovementNote(String context, String riskDependency, String observations) {
    }

    @JsonNaming(SnakeCaseStrategy.class)
    public record ValuationSummary(
            Long id,
            ValuationStatus status,
            Integer completionPercentage,
            Double analysisHours,
            Double totalEstimatedHours
    ) {
    }

    public static ImprovementResponse from(ImprovementEntity entity) {
        List<TagResponse> tags = entity.getTags().stream()
                .map(tag -> tag.getTagEntity() != null
                        ? TagResponse.from(tag.getTagEntity())
                        : new TagResponse(null, tag.getTag(), "#6B7280", null))
                .toList();

        ValuationSummary valuationSummary = entity.getValuation() == null ? null : new ValuationSummary(
                entity.getValuation().getId(),
                entity.getValuation().getStatus(),
                entity.getValuation().getCompletionPercentage(),
                entity.getValuation().getAnalysisHours(),
                entity.getValuation().getTotalEstimatedHours()
        );

        return new ImprovementResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getRequirements(),
                entity.getRedmineParentRef(),
                entity.getPriority(),
                entity.getDueDate(),
                entity.getJiraRef(),
                entity.getVersion() != null ? VersionResponse.from(entity.getVersion()) : null,
                tags,
                entity.getSoldHours(),
                entity.getStatus(),
                entity.getCompletionPercentage(),
                new ImprovementNote(entity.getNoteContext(), entity.getNoteRiskDependency(), entity.getNoteObservations()),
                valuationSummary,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
