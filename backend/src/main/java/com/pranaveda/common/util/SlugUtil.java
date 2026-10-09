package com.pranaveda.common.util;

import java.util.Locale;

/** URL-safe slug generation shared by content and taxonomy. */
public final class SlugUtil {

    private static final int MAX_LENGTH = 160;

    private SlugUtil() {
    }

    /** Lowercases, replaces runs of non-alphanumerics with '-', trims, caps length. */
    public static String slugify(String value) {
        if (value == null) {
            return "";
        }
        String slug = value.trim().toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-+|-+$)", "");
        if (slug.length() > MAX_LENGTH) {
            slug = slug.substring(0, MAX_LENGTH).replaceAll("-+$", "");
        }
        return slug;
    }
}
