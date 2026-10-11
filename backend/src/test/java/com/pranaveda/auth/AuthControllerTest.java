package com.pranaveda.auth;

import java.util.List;

import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.UnauthorizedException;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web + security slice: no database required (services are mocked), but the
 * real SecurityConfig, cookie support, origin guard, correlation filter, and
 * error envelope are exercised end-to-end through MockMvc.
 *
 * <p>Boot 4's {@code @WebMvcTest} no longer pulls in security
 * auto-configuration, so it is imported explicitly here. {@link SecurityConfig}
 * MUST come before the security auto-configurations: their++++++6++++++
 * {@code @ConditionalOnMissingBean(SecurityFilterChain)} checks must see our
 * chain, otherwise Boot registers a second catch-all default chain and
 * Spring Security 7 fails with {@code UnreachableFilterChainException}.
 */
@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, RefreshCookieSupport.class, OriginGuard.class,
         SecurityAutoConfiguration.class, ServletWebSecurityAutoConfiguration.class})
class AuthControllerTest {

    private static final String REGISTER_BODY = """
        {"email":"demo@pranaveda.dev","password":"password123","displayName":"Demo User"}""";
    private static final String LOGIN_BODY = """
        {"email":"demo@pranaveda.dev","password":"password123"}""";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    // --- register ----------------------------------------------------------

    @Test
    void registerReturnsCreatedWithHttpOnlyRefreshCookie() throws Exception {
        when(authService.register(any())).thenReturn(session("access-jwt", "refresh-plain"));

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(REGISTER_BODY))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.accessToken").value("access-jwt"))
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.expiresIn").value(900))
            .andExpect(jsonPath("$.user.role").value("USER"))
            .andExpect(header().string("Set-Cookie",
                Matchers.allOf(
                    Matchers.containsString("pv_refresh=refresh-plain"),
                    Matchers.containsString("HttpOnly"),
                    Matchers.containsString("SameSite=Strict"))))
            .andExpect(header().string("X-Correlation-Id", Matchers.not(Matchers.emptyString())));
    }

    @Test
    void registerInvalidBodyReturnsValidationEnvelopeWithoutCallingService() throws Exception {
        // Violations: email @Email, password @Size(min=8),
        // displayName @NotBlank AND @Size(min=2) (blank string also fails size)
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nope\",\"password\":\"short\",\"displayName\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.fieldErrors").isArray())
            .andExpect(jsonPath("$.fieldErrors.length()").value(4));

        verify(authService, never()).register(any());
    }

    @Test
    void registerDuplicateEmailReturnsConflict() throws Exception {
        when(authService.register(any()))
            .thenThrow(new ConflictException("An account with this email already exists."));

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(REGISTER_BODY))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    // --- login / refresh / logout -----------------------------------------

    @Test
    void loginWithBadCredentialsReturns401Envelope() throws Exception {
        when(authService.login(any(), any())).thenThrow(new UnauthorizedException("Invalid email or password."));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(LOGIN_BODY))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
            .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    void refreshRotatesCookieAndReturnsNewAccessToken() throws Exception {
        when(authService.refresh("old-plain")).thenReturn(session("new-jwt", "new-plain"));

        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("pv_refresh", "old-plain")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("new-jwt"))
            .andExpect(header().string("Set-Cookie", Matchers.containsString("pv_refresh=new-plain")));
    }

    @Test
    void refreshFromDisallowedOriginIsRejected() throws Exception {
        // Spring Security's CorsFilter rejects the foreign origin with 403
        // before the controller runs (envelope-free by design); the service
        // must never be reached either way.
        mockMvc.perform(post("/api/v1/auth/refresh")
                .header("Origin", "https://evil.example")
                .cookie(new jakarta.servlet.http.Cookie("pv_refresh", "old-plain")))
            .andExpect(status().isForbidden());

        verify(authService, never()).refresh(any());
    }

    @Test
    void logoutIsIdempotentAndClearsCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
            .andExpect(status().isNoContent())
            .andExpect(header().string("Set-Cookie", Matchers.containsString("Max-Age=0")));

        verify(authService).logout(null);
    }

    // --- /me and the authorization matrix ----------------------------------

    @Test
    void meWithoutTokenReturns401Envelope() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
            .andExpect(jsonPath("$.message").value("Authentication required."));
    }

    @Test
    void meWithAuthenticatedPrincipalReturnsSummary() throws Exception {
        when(authService.me()).thenReturn(new UserSummary(1L, "demo@pranaveda.dev", "Demo User", Role.USER));

        mockMvc.perform(get("/api/v1/auth/me").with(userPrincipal()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("demo@pranaveda.dev"))
            .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void memberRouteRejectsAnonymous() throws Exception {
        mockMvc.perform(get("/api/v1/me/dashboard"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void adminRouteRejectsAnonymous() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void adminRouteRejectsPlainUserWithForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics").with(
                authentication(new UsernamePasswordAuthenticationToken(
                    new CurrentUserPrincipal(1L, "demo@pranaveda.dev", Role.USER),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))))))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    // --- helpers -----------------------------------------------------------

    private static IssuedSession session(String accessToken, String refreshToken) {
        TokenResponse token = new TokenResponse(
            accessToken, "Bearer", 900L, new UserSummary(1L, "demo@pranaveda.dev", "Demo User", Role.USER));
        return new IssuedSession(token, refreshToken);
    }

    private static RequestPostProcessor userPrincipal() {
        return authentication(new UsernamePasswordAuthenticationToken(
            new CurrentUserPrincipal(1L, "demo@pranaveda.dev", Role.USER),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_USER"))));
    }
}

