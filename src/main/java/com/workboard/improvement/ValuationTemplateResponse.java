package com.workboard.improvement;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;

@JsonNaming(SnakeCaseStrategy.class)
public record ValuationTemplateResponse(
        Long id,
        String name,
        String textileTemplate,
        boolean isDefault,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static ValuationTemplateResponse from(ValuationTemplateEntity entity) {
        return new ValuationTemplateResponse(
                entity.getId(),
                entity.getName(),
                entity.getTextileTemplate(),
                entity.isDefault(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
