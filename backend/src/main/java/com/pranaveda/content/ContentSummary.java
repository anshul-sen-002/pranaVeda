package com.pranaveda.content;

import java.time.Instant;
import java.util.List;

import com.pranaveda.category.CategoryDto;
import com.pranaveda.category.TagDto;

/** Card-level projection used by the public list and the admin list. */
public record ContentSummary(
    long id,
    String slug,
    String title,
    String summary,
    ContentType contentType,
    Difficulty difficulty,
    Integer durationMinutes,
    String commonName,
    String sanskritName,
    String featuredImageUrl,
    ContentStatus status,
    List<CategoryDto> categories,
    List<TagDto> tags,
    List<String> goals,
    Instant publishedAt) {
}
