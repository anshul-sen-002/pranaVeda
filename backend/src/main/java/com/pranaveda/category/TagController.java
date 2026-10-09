package com.pranaveda.category;

import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Tags")
@RestController
@RequestMapping("/api/v1/tags")
public class TagController {

    private final TaxonomyService taxonomyService;

    public TagController(TaxonomyService taxonomyService) {
        this.taxonomyService = taxonomyService;
    }

    @GetMapping
    public List<TagDto> list() {
        return taxonomyService.listTags();
    }
}
