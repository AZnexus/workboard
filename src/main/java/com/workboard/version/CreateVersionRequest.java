package com.workboard.version;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateVersionRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 7) String color
) {
    public CreateVersionRequest {
        if (color == null) color = VersionDefaults.COLOR;
    }
}
