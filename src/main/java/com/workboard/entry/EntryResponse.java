package com.workboard.entry;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.workboard.tag.TagResponse;

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
        List<TagResponse> tags,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public static EntryResponse from(EntryEntity entity) {
        List<TagResponse> tagResponses = entity.getTags().stream()
                .map(et -> {
                    if (et.getTagEntity() != null) {
                        return new TagResponse(
                                et.getTagEntity().getId(),
                                et.getTagEntity().getName(),
                                et.getTagEntity().getColor(),
                                et.getTagEntity().getCreatedAt());
                    }
                    return new TagResponse(null, et.getTag(), "#6B7280", null);
                })
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
                tagResponses,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
