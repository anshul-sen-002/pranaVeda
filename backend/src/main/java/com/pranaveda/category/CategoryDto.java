package com.pranaveda.category;

/** Read model for categories. */
public record CategoryDto(long id, String slug, String name, String description) {

    public static CategoryDto from(Category category) {
        return new CategoryDto(category.getId(), category.getSlug(),
            category.getName(), category.getDescription());
    }
}
