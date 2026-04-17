package com.workboard.timelog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTimeLogRequest(
        Long entryId,
        LocalDate date,
        @DecimalMin("0.01") BigDecimal hours,
        @Size(max = 100) String project,
        String description,
        @Size(max = 50) String taskCode
) {}
