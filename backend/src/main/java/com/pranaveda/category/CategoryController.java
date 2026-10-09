package com.pranaveda.category;

import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Categories")
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final TaxonomyService taxonomyService;

    public CategoryController(TaxonomyService taxonomyService) {
        this.taxonomyService = taxonomyService;
    }

    @GetMapping
    public List<CategoryDto> list() {
        return taxonomyService.listCategories();
    }
}
