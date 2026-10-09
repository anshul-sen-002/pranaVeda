package com.pranaveda.category;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/** ADMIN-only taxonomy management (covered by the /api/v1/admin/** rule). */
@Tag(name = "Admin taxonomy")
@RestController
@RequestMapping("/api/v1/admin")
public class AdminTaxonomyController {

    private final TaxonomyService taxonomyService;

    public AdminTaxonomyController(TaxonomyService taxonomyService) {
        this.taxonomyService = taxonomyService;
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody AdminTaxonomyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taxonomyService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public CategoryDto updateCategory(@PathVariable long id,
                                      @Valid @RequestBody AdminTaxonomyRequest request) {
        return taxonomyService.updateCategory(id, request);
    }

    @PostMapping("/tags")
    public ResponseEntity<TagDto> createTag(@Valid @RequestBody AdminTaxonomyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taxonomyService.createTag(request));
    }

    @PutMapping("/tags/{id}")
    public TagDto updateTag(@PathVariable long id,
                            @Valid @RequestBody AdminTaxonomyRequest request) {
        return taxonomyService.updateTag(id, request);
    }
}
