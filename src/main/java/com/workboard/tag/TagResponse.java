package com.workboard.tag;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record TagResponse(
        Long id,
        String name,
        String color,
        @JsonProperty("created_at") Instant createdAt
) {
    public static TagResponse from(TagEntity entity) {
        return new TagResponse(
                entity.getId(),
                entity.getName(),
                entity.getColor(),
                entity.getCreatedAt()
        );
    }
}
