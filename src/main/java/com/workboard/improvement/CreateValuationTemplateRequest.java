package com.workboard.improvement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateValuationTemplateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank String textileTemplate,
        Boolean isDefault,
        Boolean active
) {
    public CreateValuationTemplateRequest {
        if (isDefault == null) {
            isDefault = false;
        }
        if (active == null) {
            active = true;
        }
    }
}
