package com.pranaveda.config;

import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pranaveda.security.ApiAccessDeniedHandler;
import com.pranaveda.security.ApiAuthenticationEntryPoint;
import com.pranaveda.security.JwtAuthenticationFilter;
import com.pranaveda.security.JwtService;
import com.pranaveda.user.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security chain (architecture section 6): stateless bearer auth for the API,
 * HttpOnly refresh cookie for rotation, explicit authorization matrix.
 *
 * <p>CSRF is disabled at the framework level because the only
 * cookie-authenticated state changes ({@code /auth/refresh},
 * {@code /auth/logout}) are protected by SameSite=Strict (cross-site requests
 * never carry the cookie) plus the {@link com.pranaveda.security.OriginGuard}
 * allow-list check; bearer-token requests are CSRF-immune.
 */
@Configuration
public class SecurityConfig {

    private final String allowedOrigins;
    private final JwtService jwtService;
    private final UserRepository users;
    private final ObjectMapper objectMapper;

    public SecurityConfig(@Value("${app.cors.allowed-origins}") String allowedOrigins,
                          JwtService jwtService,
                          UserRepository users,
                          ObjectMapper objectMapper) {
        this.allowedOrigins = allowedOrigins;
        this.jwtService = jwtService;
        this.users = users;
        this.objectMapper = objectMapper;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // public infrastructure
                .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info",
                                 "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                // public auth endpoints - identity is resolved inside the service
                .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login",
                                 "/api/v1/auth/refresh", "/api/v1/auth/logout").permitAll()
                // ADMIN content studio (agents.md authorization matrix)
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                // personal endpoints - ownership is re-checked in the services
                .requestMatchers("/api/v1/me/**", "/api/v1/auth/me").authenticated()
                // public content APIs (Phase 3+): anonymous browsing stays open
                .anyRequest().permitAll())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(new ApiAuthenticationEntryPoint(objectMapper))
                .accessDeniedHandler(new ApiAccessDeniedHandler(objectMapper)))
            // constructed here (not a bean) so Boot does not register it a
            // second time as a servlet filter
            .addFilterBefore(new JwtAuthenticationFilter(jwtService, users),
                             UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Explicit origin allow-list (never a wildcard with credentials).
     * The comma-separated property value is trimmed and empty entries dropped.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of(
            HttpMethod.GET.name(), HttpMethod.POST.name(), HttpMethod.PUT.name(),
            HttpMethod.PATCH.name(), HttpMethod.DELETE.name(), HttpMethod.OPTIONS.name()));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

