package com.pranaveda.content;

import java.time.Instant;
import java.util.List;

import com.pranaveda.category.CategoryController;
import com.pranaveda.category.TagController;
import com.pranaveda.category.TaxonomyService;
import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.config.SecurityConfig;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.security.JwtService;
import com.pranaveda.security.OriginGuard;
import com.pranaveda.user.Role;
import com.pranaveda.user.UserRepository;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The core product promise (agents.md 2.1): anonymous visitors can browse
 * published content and taxonomy, while drafts never leak and admin routes
 * stay closed to plain users.
 */
@WebMvcTest(controllers = {ContentController.class, CategoryController.class, TagController.class})
@Import({SecurityConfig.class, OriginGuard.class,
         SecurityAutoConfiguration.class, ServletWebSecurityAutoConfiguration.class})
class ContentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContentService contentService;

    @MockitoBean
    private AdminContentService adminContentService;

    @MockitoBean
    private TaxonomyService taxonomyService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    // --- anonymous browsing (no login required) -----------------------------

    @Test
    void anonymousVisitorCanListPublishedContent() throws Exception {
        when(contentService.list(any())).thenReturn(page());

        mockMvc.perform(get("/api/v1/content?difficulty=BEGINNER&sort=newest&page=0&size=12"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].slug").value("mountain-pose"))
            .andExpect(jsonPath("$.content[0].status").value("PUBLISHED"))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void anonymousVisitorCanReadAPublishedItem() throws Exception {
        when(contentService.getPublished("mountain-pose")).thenReturn(detail());

        mockMvc.perform(get("/api/v1/content/mountain-pose"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.summary.slug").value("mountain-pose"))
            .andExpect(jsonPath("$.summary.contentType").value("ASANA"))
            .andExpect(jsonPath("$.description").value("Long description"));
    }

    @Test
    void anonymousVisitorCanListCategoriesAndTags() throws Exception {
        when(taxonomyService.listCategories()).thenReturn(List.of());
        when(taxonomyService.listTags()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/categories")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/tags")).andExpect(status().isOk());
    }

    // --- query parameter validation -----------------------------------------

    @Test
    void unknownSortReturnsValidationEnvelope() throws Exception {
        mockMvc.perform(get("/api/v1/content?sort=bogus"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.message").value(Matchers.containsString("Unknown sort 'bogus'")));
    }

    @Test
    void unknownEnumFilterReturns400Not500() throws Exception {
        mockMvc.perform(get("/api/v1/content?difficulty=SUPERHUMAN"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.fieldErrors[0].field").value("difficulty"))
            .andExpect(jsonPath("$.correlationId").exists());
    }

    // --- drafts never leak ---------------------------------------------------

    @Test
    void missingOrDraftSlugIsNotFoundForEveryone() throws Exception {
        when(contentService.getPublished(anyString())).thenThrow(new NotFoundException("Content not found."));

        mockMvc.perform(get("/api/v1/content/super-secret-draft"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    // --- admin routes are closed to plain users ------------------------------

    @Test
    void adminContentRouteRejectsAnonymous() throws Exception {
        mockMvc.perform(post("/api/v1/admin/content")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validBody()))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void adminContentRouteRejectsPlainUserWithForbidden() throws Exception {
        mockMvc.perform(post("/api/v1/admin/content")
                .with(userPrincipal())
                .contentType(MediaType.APPLICATION_JSON)
                .content(validBody()))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void adminPublishRouteRequiresAdminRole() throws Exception {
        mockMvc.perform(post("/api/v1/admin/content/1/publish").with(userPrincipal()))
            .andExpect(status().isForbidden());
    }

    @Test
    void adminTaxonomyRouteRejectsPlainUser() throws Exception {
        mockMvc.perform(post("/api/v1/admin/categories")
                .with(userPrincipal())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Morning\"}"))
            .andExpect(status().isForbidden());
    }

    // --- helpers -------------------------------------------------------------

    private static ContentSummary summary() {
        return new ContentSummary(1L, "mountain-pose", "Mountain Pose", "Stand tall.",
            ContentType.ASANA, Difficulty.BEGINNER, 10, null, null, null, null, ContentStatus.PUBLISHED,
            List.of(), List.of(), List.of(), Instant.parse("2026-01-01T00:00:00Z"));
    }

    private static PageResponse<ContentSummary> page() {
        return new PageResponse<>(List.of(summary()), 0, 12, 1, 1);
    }

    private static ContentDetail detail() {
        return new ContentDetail(summary(), "Long description", null, null, null, null, null, null,
            null, null, List.of(), List.of(), Instant.parse("2026-01-01T00:00:00Z"),
            Instant.parse("2026-01-01T00:00:00Z"), 1L, 1L);
    }

    private static String validBody() {
        return "{\"title\":\"Tree Pose\",\"contentType\":\"ASANA\"}";
    }

    private static RequestPostProcessor userPrincipal() {
        return authentication(new UsernamePasswordAuthenticationToken(
            new CurrentUserPrincipal(1L, "demo@pranaveda.dev", Role.USER),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_USER"))));
    }
}
