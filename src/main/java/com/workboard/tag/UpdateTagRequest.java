package com.workboard.tag;

import jakarta.validation.constraints.Size;

public record UpdateTagRequest(
        @Size(max = 50) String name,
        @Size(max = 7) String color
) {
}
