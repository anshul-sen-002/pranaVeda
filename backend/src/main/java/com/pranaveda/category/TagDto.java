package com.pranaveda.category;

/** Read model for tags. */
public record TagDto(long id, String slug, String name) {

    public static TagDto from(Tag tag) {
        return new TagDto(tag.getId(), tag.getSlug(), tag.getName());
    }
}
