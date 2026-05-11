package com.workboard.version;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;

@JsonNaming(SnakeCaseStrategy.class)
public record VersionResponse(
        Long id,
        String name,
        String color,
        boolean active,
        Instant createdAt
) {
    public static VersionResponse from(VersionEntity entity) {
        return new VersionResponse(
                entity.getId(),
                entity.getName(),
                entity.getColor(),
                entity.isActive(),
                entity.getCreatedAt()
        );
    }
}
