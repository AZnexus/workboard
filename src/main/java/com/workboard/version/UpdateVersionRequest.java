package com.workboard.version;

import jakarta.validation.constraints.Size;

public record UpdateVersionRequest(
        @Size(max = 100) String name,
        Boolean active,
        @Size(max = 7) String color
) {
}
