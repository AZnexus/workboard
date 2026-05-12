package com.workboard.improvement;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.workboard.tag.TagResponse;
import com.workboard.version.VersionResponse;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@JsonNaming(SnakeCaseStrategy.class)
public record ValuationResponse(
        Long id,
        Long improvementId,
        String derivedTitle,
        String redmineChildRef,
        LocalDate dueDate,
        ValuationStatus status,
        Integer completionPercentage,
        Integer priority,
        VersionResponse version,
        List<TagResponse> tags,
        String textileBody,
        String structuredContentJson,
        Double analysisHours,
        Double totalEstimatedHours,
        Instant createdAt,
        Instant updatedAt
) {
    public static ValuationResponse from(ValuationEntity entity) {
        List<TagResponse> tags = entity.getImprovement().getTags().stream()
                .map(tag -> tag.getTagEntity() != null
                        ? TagResponse.from(tag.getTagEntity())
                        : new TagResponse(null, tag.getTag(), "#6B7280", null))
                .toList();

        return new ValuationResponse(
                entity.getId(),
                entity.getImprovement().getId(),
                entity.getDerivedTitle(),
                entity.getRedmineChildRef(),
                entity.getDueDate(),
                entity.getStatus(),
                entity.getCompletionPercentage(),
                entity.getPriority(),
                entity.getVersion() != null ? VersionResponse.from(entity.getVersion()) : null,
                tags,
                entity.getTextileBody(),
                entity.getStructuredContentJson(),
                entity.getAnalysisHours(),
                entity.getTotalEstimatedHours(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
