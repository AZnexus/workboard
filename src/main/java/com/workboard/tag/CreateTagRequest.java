package com.workboard.tag;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTagRequest(
        @NotBlank @Size(max = 50) String name,
        @Size(max = 7) String color
) {
    public CreateTagRequest {
        if (color == null) color = "#6B7280";
    }
}
