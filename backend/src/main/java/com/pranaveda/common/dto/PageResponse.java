package com.pranaveda.common.dto;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Uniform pagination payload (architecture section 8):
 * {@code ?page=0&size=20&sort=field,dir} responses always look like this.
 */
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages) {

    public static <T> PageResponse<T> from(Page<T> source) {
        return new PageResponse<>(
            source.getContent(),
            source.getNumber(),
            source.getSize(),
            source.getTotalElements(),
            source.getTotalPages());
    }

    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = size <= 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        return new PageResponse<>(content, page, size, totalElements, totalPages);
    }
}
