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
        Boolean scheduledToday,
        List<Long> tagIds,
        String externalRef,
        Boolean pinned,
        Integer priority,
        boolean dueDateProvided,
        boolean scheduledTodayProvided
) {
    public UpdateEntryRequest(
            EntryType type,
            String title,
            String body,
            EntryStatus status,
            LocalDate date,
            LocalDate dueDate,
            Boolean scheduledToday,
            List<Long> tagIds,
            String externalRef,
            Boolean pinned,
            Integer priority
    ) {
        this(type, title, body, status, date, dueDate, scheduledToday, tagIds, externalRef, pinned, priority, false, false);
    }
}
