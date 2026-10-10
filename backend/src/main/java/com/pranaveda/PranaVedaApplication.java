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
 */
@SpringBootApplication
@ConfigurationPropertiesScan // binds @ConfigurationProperties records (app.media.*, app.cloudinary.*, app.ai.*)
public class PranaVedaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PranaVedaApplication.class, args);
    }
}
