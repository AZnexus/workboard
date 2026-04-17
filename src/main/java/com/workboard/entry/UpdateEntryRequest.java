package com.workboard.entry;

import java.time.LocalDate;
import java.util.List;

public record UpdateEntryRequest(
        EntryType type,
        String title,
        String body,
        EntryStatus status,
        LocalDate date,
        List<String> tags,
        String externalRef,
        Boolean pinned
) {
}
