package com.workboard.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProjectRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        @Size(max = 7) String color
) {
    public CreateProjectRequest {
        if (color == null) color = "#3B82F6";
    }
}
