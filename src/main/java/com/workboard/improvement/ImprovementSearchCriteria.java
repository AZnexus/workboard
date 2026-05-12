package com.workboard.improvement;

import java.time.LocalDate;

public record ImprovementSearchCriteria(
        String query,
        ImprovementStatus status,
        Integer priority,
        Long versionId,
        String tag,
        Boolean hasValuation,
        Integer completionFrom,
        Integer completionTo,
        LocalDate dueDateFrom,
        LocalDate dueDateTo
) {
}
