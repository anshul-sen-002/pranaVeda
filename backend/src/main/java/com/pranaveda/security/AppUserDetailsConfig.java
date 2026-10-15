package com.pranaveda.security;

import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Database-backed authentication identity (replaces Boot's generated
 * in-memory user). Resolves by normalized email; disabled accounts are
 * rejected here so they can never authenticate.
 */
@Configuration
public class AppUserDetailsConfig {

    @Bean
    UserDetailsService userDetailsService(UserRepository users) {
        return username -> {
            String email = username == null ? "" : username.trim().toLowerCase(java.util.Locale.ROOT);
            User user = users.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
            if (!user.isEnabled()) {
                throw new UsernameNotFoundException("Account is disabled.");
            }
            return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        };
    }
}
