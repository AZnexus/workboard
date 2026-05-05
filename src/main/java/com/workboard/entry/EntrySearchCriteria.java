package com.workboard.entry;

import java.time.LocalDate;

record EntrySearchCriteria(
        LocalDate date,
        LocalDate dateFrom,
        LocalDate dateTo,
        EntryStatus status,
        EntryType type,
        String tag,
        Boolean pinned,
        Integer priority,
        String query
) {
}
