package com.workboard.entry;

import org.springframework.data.domain.Sort;

public final class EntrySorts {

    private EntrySorts() {
    }

    public static Sort defaultSort() {
        return Sort.by(EntryQueryPaths.PINNED).descending()
                .and(Sort.by(EntryQueryPaths.CREATED_AT).descending());
    }
}
