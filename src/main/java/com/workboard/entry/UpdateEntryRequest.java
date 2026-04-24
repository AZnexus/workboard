package com.workboard.entry;

import java.time.LocalDate;
import java.util.List;

public record UpdateEntryRequest(
        EntryType type,
        String title,
        String body,
        EntryStatus status,
        LocalDate date,
        LocalDate dueDate,
        List<Long> tagIds,
        String externalRef,
        Boolean pinned,
        Integer priority,
        boolean dueDateProvided
) {
    public UpdateEntryRequest(
            EntryType type,
            String title,
            String body,
            EntryStatus status,
            LocalDate date,
            LocalDate dueDate,
            List<Long> tagIds,
            String externalRef,
            Boolean pinned,
            Integer priority
    ) {
        this(type, title, body, status, date, dueDate, tagIds, externalRef, pinned, priority, false);
    }
}
