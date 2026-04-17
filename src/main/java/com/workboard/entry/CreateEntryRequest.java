package com.workboard.entry;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record CreateEntryRequest(
        @NotNull EntryType type,
        @NotBlank @Size(max = 200) String title,
        String body,
        EntryStatus status,
        LocalDate date,
        List<String> tags,
        String externalRef
) {
    public CreateEntryRequest {
        if (date == null) date = LocalDate.now();
        if (tags == null) tags = new ArrayList<>();
    }
}
