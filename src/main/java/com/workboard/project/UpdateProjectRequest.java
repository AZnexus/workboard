package com.workboard.project;

import jakarta.validation.constraints.Size;

public record UpdateProjectRequest(
        @Size(max = 100) String name,
        String description,
        @Size(max = 7) String color,
        Boolean active
) {}
