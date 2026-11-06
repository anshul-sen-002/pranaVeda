package com.pranaveda.mail;

import java.util.List;
import java.util.Map;
import java.net.http.HttpClient;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends transactional email. Two hard guarantees (agents.md reliability):
 *
 * <ol>
 *   <li><b>Best-effort:</b> every send is wrapped so an API outage, a bad
 *       address, or any {@link RuntimeException} is logged and swallowed. A
 *       login must never fail because email failed.</li>
 *   <li><b>Non-blocking:</b> sends run on the {@code mailExecutor} thread pool
 *       via {@link Async}, so the request returns immediately.</li>
 * </ol>
 *
 * When {@link MailProperties#isEnabled()} is false or the Resend API key is
 * missing, the service is a no-op.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private static final String RESEND_EMAILS_URL = "https://api.resend.com/emails";

    private final RestClient restClient;
    private final MailProperties properties;

    public EmailService(MailProperties properties) {
        HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
        this.properties = properties;
    }

    /**
     * "New sign-in to your account" security notice (agents.md 2.3).
     * Never throws; failures are logged only.
     */
    @Async("mailExecutor")
    public void sendLoginAlert(String toEmail, String displayName, String whenIso, String ip) {
        if (!properties.isEnabled()) {
            log.warn("Transactional email is disabled; skipping email to {}", maskEmail(toEmail));
            return;
        }
        String name = (displayName == null || displayName.isBlank()) ? "there" : displayName.trim();
        String subject = "New sign-in to your PranaVeda account";
        String html = """
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;
                        padding:24px;color:#223240">
              <h2 style="color:#1789c7;margin:0 0 12px">Hi %s,</h2>
              <p style="line-height:1.6;margin:0 0 12px">
                We noticed a new sign-in to your PranaVeda account.
              </p>
              <table style="font-size:14px;line-height:1.6;margin:0 0 16px">
                <tr><td style="color:#5a6b78;padding-right:12px">When</td><td>%s</td></tr>
                <tr><td style="color:#5a6b78;padding-right:12px">IP address</td><td>%s</td></tr>
              </table>
              <p style="line-height:1.6;margin:0 0 12px">
                If this was you, no action is needed. If you don't recognise this
                activity, please change your password right away.
              </p>
              <p style="color:#93a3ae;font-size:12px;margin:16px 0 0">
                PranaVeda &mdash; a calm space for yoga and wellness.
              </p>
            </div>
            """.formatted(escape(name), escape(whenIso == null ? "just now" : whenIso),
                          escape(ip == null ? "unknown" : ip));
        send(toEmail, subject, html);
    }

    /** "Welcome to PranaVeda" email sent after registration (agents.md 2.3).
     * Never throws; failures are logged only so registration always succeeds.
     */
    @Async("mailExecutor")
    public void sendWelcomeEmail(String toEmail, String displayName) {
        if (!properties.isEnabled()) {
            log.warn("Welcome email skipped because MAIL_ENABLED is false (recipient {})", maskEmail(toEmail));
            return;
        }
        String name = (displayName == null || displayName.isBlank()) ? "there" : displayName.trim();
        String subject = "Welcome to PranaVeda — your calm practice space is ready";
        String html = """
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;
                        padding:24px;color:#223240">
              <h2 style="color:#1789c7;margin:0 0 12px">Hi %s,</h2>
              <p style="line-height:1.6;margin:0 0 12px">
                Welcome to PranaVeda — your calm space for yoga, guided audio, and personal wellness.
              </p>
              <p style="line-height:1.6;margin:0 0 12px">
                Explore yoga poses, calming soundscapes, and guided breathing — no account needed
                to browse. Sign in to save practices, track streaks, and build your own routines.
              </p>
              <p style="line-height:1.6;margin:0 0 12px">
                Start here: <a href="https://pranaveda.example/yoga" style="color:#1789c7">Yoga Library</a>
              </p>
              <p style="color:#93a3ae;font-size:12px;margin:16px 0 0">
                PranaVeda &mdash; a calm space for yoga and wellness.
              </p>
            </div>
            """.formatted(escape(name));
        send(toEmail, subject, html);
    }

    private void send(String toEmail, String subject, String html) {
        if (!properties.isEnabled()) {
            return;
        }
        if (properties.getResendApiKey() == null || properties.getResendApiKey().isBlank()) {
            log.warn("Resend API key is not configured; skipping email to {}", maskEmail(toEmail));
            return;
        }
        if (properties.getFrom() == null || properties.getFrom().isBlank()) {
            log.warn("Verified sender address is not configured; skipping email to {}", maskEmail(toEmail));
            return;
        }

        String from = properties.getFromName() == null || properties.getFromName().isBlank()
            ? properties.getFrom()
            : properties.getFromName().trim() + " <" + properties.getFrom().trim() + ">";
        try {
            Map<?, ?> result = restClient.post()
                .uri(RESEND_EMAILS_URL)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getResendApiKey().trim())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                    "from", from,
                    "to", List.of(toEmail),
                    "subject", subject,
                    "html", html
                ))
                .retrieve()
                .body(Map.class);
            Object emailId = result == null ? null : result.get("id");
            log.info("Resend accepted transactional email id={} recipient={} senderDomain={}",
                emailId, maskEmail(toEmail), senderDomain(properties.getFrom()));
        } catch (RestClientResponseException ex) {
            int status = ex.getStatusCode().value();
            log.warn("Resend rejected transactional email for {} (HTTP {}: {}; response={})",
                maskEmail(toEmail), status, rejectionHint(status), safeErrorBody(ex.getResponseBodyAsString()));
        } catch (RuntimeException ex) {
            // Deliberately swallowed: email is best-effort and must not affect auth.
            log.warn("Resend request failed for {} ({})", maskEmail(toEmail), ex.getClass().getSimpleName());
        }
    }

    private static String rejectionHint(int status) {
        return switch (status) {
            case 400, 422 -> "check request fields and verify MAIL_FROM in Resend";
            case 401 -> "RESEND_API_KEY was rejected";
            case 403 -> "check API key permissions and verified sender domain";
            case 429 -> "Resend rate or plan limit reached";
            default -> "Resend returned an error";
        };
    }

    private static String safeErrorBody(String body) {
        if (body == null || body.isBlank()) return "empty response";
        String safe = body.replaceAll("(?i)[A-Z0-9._%+-]+@([A-Z0-9.-]+\\.[A-Z]{2,})", "[address]@$1")
            .replaceAll("[\\r\\n\\t]+", " ");
        return safe.length() > 320 ? safe.substring(0, 320) : safe;
    }

    private static String senderDomain(String from) {
        if (from == null) return "unconfigured";
        int at = from.lastIndexOf('@');
        return at >= 0 && at + 1 < from.length()
            ? from.substring(at + 1).replaceAll("[^A-Za-z0-9.-].*$", "")
            : "unconfigured";
    }

    /** Minimal HTML-escaping so a display name cannot inject markup. */
    private static String escape(String value) {
        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;");
    }

    /** Never log a full address. */
    private static String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***";
        }
        return email.charAt(0) + "***@" + email.substring(at + 1);
    }
}
