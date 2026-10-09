package com.pranaveda.auth;

import com.pranaveda.user.Role;
import com.pranaveda.user.User;

/** Safe account projection - never contains the password hash. */
public record UserSummary(long id, String email, String displayName, Role role) {

    public static UserSummary from(User user) {
        return new UserSummary(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole());
    }
}
