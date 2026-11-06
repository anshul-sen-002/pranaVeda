package com.pranaveda.mail;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Transactional email settings, bound from {@code app.mail.*}.
 *
 * <p>{@code enabled} defaults to false so the application boots and runs locally
 * without an SMTP server. When disabled, {@link EmailService} becomes a no-op
 * and the Resend API client is never called.
 */
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {

    /** Master switch. Local dev runs with this off. */
    private boolean enabled = false;

    /** Verified sender address. Override via MAIL_FROM. */
    private String from = "";

    /** Friendly display name paired with {@link #from}. Override via MAIL_FROM_NAME. */
    private String fromName = "PranaVeda";

    /** Resend API key. Override via RESEND_API_KEY. */
    private String resendApiKey = "";

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

    public String getResendApiKey() {
        return resendApiKey;
    }

    public void setResendApiKey(String resendApiKey) {
        this.resendApiKey = resendApiKey;
    }
}
