package com.workboard.timelog;

import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@JsonNaming(SnakeCaseStrategy.class)
public record TimeLogResponse(
        Long id,
        Long entryId,
        LocalDate date,
        BigDecimal hours,
        String project,
        String description,
        Instant createdAt
) {
    public static TimeLogResponse from(TimeLogEntity entity) {
        return new TimeLogResponse(
                entity.getId(),
                entity.getEntry() != null ? entity.getEntry().getId() : null,
                entity.getDate(),
                entity.getHours(),
                entity.getProject(),
                entity.getDescription(),
                entity.getCreatedAt()
        );
    }
}
