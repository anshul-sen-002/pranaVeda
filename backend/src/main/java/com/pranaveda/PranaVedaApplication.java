package com.pranaveda;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * PranaVeda backend entry point.
 *
 * <p>Package layout and layering rules are defined in docs/architecture.md:
 * controllers stay thin, services own business + authorization rules,
 * repositories own persistence, entities are never exposed to clients.
 *
 * <p>{@code ErrorMvcAutoConfiguration} is excluded so that Spring Boot's
 * {@code BasicErrorController} is not registered for {@code /error}. The API
 * uses a custom {@link com.pranaveda.common.web.ErrorController} that returns
 * JSON instead of HTML whitelabel error pages, preventing
 * "response has already been committed" errors.
 */
@SpringBootApplication(exclude = {org.springframework.boot.webmvc.autoconfigure.error.ErrorMvcAutoConfiguration.class})
@ConfigurationPropertiesScan // binds @ConfigurationProperties records (app.media.*, app.cloudinary.*, app.ai.*)
public class PranaVedaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PranaVedaApplication.class, args);
    }
}
