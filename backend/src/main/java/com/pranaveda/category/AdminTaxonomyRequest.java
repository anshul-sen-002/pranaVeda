package com.pranaveda.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Create/update payload for admin category/tag endpoints (description applies to categories only). */
public record AdminTaxonomyRequest(
    @NotBlank @Size(max = 120) String name,
    @Size(max = 120) String slug,
    @Size(max = 500) String description) {
}
