package com.workboard.shared;

import java.util.List;

public record PageResponse<T>(
        List<T> data,
        Meta meta
) {
    public record Meta(long total, int page, int size, int totalPages) {}

    public static <T> PageResponse<T> from(org.springframework.data.domain.Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                new Meta(page.getTotalElements(), page.getNumber(), page.getSize(), page.getTotalPages())
        );
    }
}
