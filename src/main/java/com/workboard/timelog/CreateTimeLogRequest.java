package com.workboard.timelog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTimeLogRequest(
        Long entryId,
        @NotNull LocalDate date,
        @NotNull @DecimalMin("0.01") BigDecimal hours,
        @NotBlank @Size(max = 100) String project,
        String description
) {}
