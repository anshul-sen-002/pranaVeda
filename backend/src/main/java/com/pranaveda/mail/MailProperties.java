package com.pranaveda.mail;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Email (SMTP) settings, bound from {@code app.mail.*}.
 *
 * <p>{@code enabled} defaults to false so the application boots and runs locally
 * without an SMTP server. When disabled, {@link EmailService} becomes a no-op
 * and the {@code JavaMailSender} is never touched.
 */
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {

    /** Master switch. Local dev runs with this off. */
    private boolean enabled = false;

    /** From address for transactional emails. Override via MAIL_FROM. */
    private String from = "no-reply@pranaveda.local";

    /** Friendly display name paired with {@link #from}. Override via MAIL_FROM_NAME. */
    private String fromName = "PranaVeda";

    /** SMTP host. Only used when {@link #enabled} is true. */
    private String host = "localhost";

    /** SMTP port (587 = STARTTLS submission, 465 = implicit TLS). */
    private int port = 587;

    /** SMTP username; empty means anonymous (typical for localhost relays). */
    private String username = "";

    /** SMTP password; empty means anonymous. */
    private String password = "";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getFromName() {
        return fromName;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
