package com.pranaveda.config;

import com.pranaveda.user.Role;
import com.pranaveda.user.UserRepository;
import com.pranaveda.user.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Controlled first-admin bootstrap (agents.md section 9): if ADMIN_EMAIL and
 * ADMIN_PASSWORD are both provided via environment, and no account with that
 * email exists, an ADMIN account is created at startup. No default admin, no
 * known password, nothing is ever overwritten.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserService userService;
    private final UserRepository users;
    private final String adminEmail;
    private final String adminPassword;

    public AdminBootstrap(UserService userService,
                          UserRepository users,
                          @Value("${ADMIN_EMAIL:}") String adminEmail,
                          @Value("${ADMIN_PASSWORD:}") String adminPassword) {
        this.userService = userService;
        this.users = users;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank()
            || adminPassword == null || adminPassword.isBlank()) {
            log.debug("Admin bootstrap: ADMIN_EMAIL/ADMIN_PASSWORD not set - skipped.");
            return;
        }
        if (adminPassword.length() < 8) {
            log.error("Admin bootstrap: ADMIN_PASSWORD must be at least 8 characters - skipped.");
            return;
        }
        String email = UserService.normalizeEmail(adminEmail);
        if (users.existsByEmail(email)) {
            log.info("Admin bootstrap: account {} already exists - nothing to do.", email);
            return;
        }
        userService.create(email, adminPassword, "Administrator", Role.ADMIN);
        log.info("Admin bootstrap: created ADMIN account {}.", email);
    }
}
