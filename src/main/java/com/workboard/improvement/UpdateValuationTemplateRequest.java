package com.workboard.improvement;

import jakarta.validation.constraints.Size;

public record UpdateValuationTemplateRequest(
        @Size(max = 100) String name,
        String textileTemplate,
        Boolean isDefault,
        Boolean active
) {
}
