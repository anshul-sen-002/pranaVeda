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
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.RequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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
 */
@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, RefreshCookieSupport.class, OriginGuard.class})
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
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nope\",\"password\":\"short\",\"displayName\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.fieldErrors").isArray())
            .andExpect(jsonPath("$.fieldErrors.length()").value(3));

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
        when(authService.login(any())).thenThrow(new UnauthorizedException("Invalid email or password."));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(LOGIN_BODY))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
            .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }
