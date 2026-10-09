package com.pranaveda.user;

import java.util.Locale;

import com.pranaveda.common.error.NotFoundException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Account lookup and creation. Passwords are hashed here (BCrypt) - plaintext
 * never reaches storage. Email is normalized centrally so uniqueness and
 * login use the same form.
 */
@Service
public class UserService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public User create(String rawEmail, String rawPassword, String displayName, Role role) {
        User user = new User();
        user.setEmail(normalizeEmail(rawEmail));
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setDisplayName(displayName.trim());
        user.setRole(role);
        user.setEnabled(true);
        return users.save(user);
    }

    @Transactional(readOnly = true)
    public User getById(long id) {
        return users.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found."));
    }

    @Transactional(readOnly = true)
    public User getByEmail(String rawEmail) {
        return users.findByEmail(normalizeEmail(rawEmail))
            .orElseThrow(() -> new NotFoundException("User not found."));
    }

    @Transactional(readOnly = true)
    public boolean emailExists(String rawEmail) {
        return users.existsByEmail(normalizeEmail(rawEmail));
    }
}
