package com.pranaveda.mail;

import java.io.UnsupportedEncodingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Sends transactional email. Two hard guarantees (agents.md reliability):
 *
 * <ol>
 *   <li><b>Best-effort:</b> every send is wrapped so an SMTP outage, a bad
 *       address, or any {@link RuntimeException} is logged and swallowed. A
 *       login must never fail because email failed.</li>
 *   <li><b>Non-blocking:</b> sends run on the {@code mailExecutor} thread pool
 *       via {@link Async}, so the request returns immediately.</li>
 * </ol>
 *
 * When {@link MailProperties#isEnabled()} is false the service is a no-op, so
 * local development works with no SMTP server configured.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final MailProperties properties;

    /**
     * The sender is injected lazily via {@link ObjectProvider} because
     * {@link MailSenderConfig} only creates a {@code JavaMailSender} bean when
     * {@code app.mail.enabled=true}. With mail disabled (local dev default) no
     * bean exists, and a required constructor dependency would prevent the
     * whole application from starting. Resolving it lazily keeps the service a
     * silent no-op when mail is off.
     */
    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider, MailProperties properties) {
        this.mailSenderProvider = mailSenderProvider;
        this.properties = properties;
    }

    /**
     * "New sign-in to your account" security notice (agents.md 2.3).
     * Never throws; failures are logged only.
     */
    @Async("mailExecutor")
    public void sendLoginAlert(String toEmail, String displayName, String whenIso, String ip) {
        if (!properties.isEnabled()) {
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

    private void send(String toEmail, String subject, String html) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            // Mail is disabled (no sender bean): nothing to do, never an error.
            log.debug("No mail sender configured; skipping email to {}", maskEmail(toEmail));
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(properties.getFrom(), properties.getFromName());
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Login alert email queued for {}", maskEmail(toEmail));
        } catch (MessagingException | UnsupportedEncodingException | RuntimeException ex) {
            // Deliberately swallowed: email is best-effort and must not affect auth.
            log.warn("Failed to send login alert email to {}: {}", maskEmail(toEmail), ex.getMessage());
        }
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
