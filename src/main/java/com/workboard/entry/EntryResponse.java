package com.workboard.entry;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record EntryResponse(
        Long id,
        EntryType type,
        String title,
        String body,
        EntryStatus status,
        LocalDate date,
        @JsonProperty("external_ref") String externalRef,
        boolean pinned,
        Integer priority,
        List<String> tags,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public static EntryResponse from(EntryEntity entity) {
        List<String> tagNames = entity.getTags().stream()
                .map(EntryTagEntity::getTag)
                .toList();
        return new EntryResponse(
                entity.getId(),
                entity.getType(),
                entity.getTitle(),
                entity.getBody(),
                entity.getStatus(),
                entity.getDate(),
                entity.getExternalRef(),
                entity.isPinned(),
                entity.getPriority(),
                tagNames,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
