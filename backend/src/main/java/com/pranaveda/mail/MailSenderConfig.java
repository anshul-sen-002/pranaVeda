package com.pranaveda.mail;

import java.util.Properties;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Our own {@code JavaMailSender}, created <b>only</b> when
 * {@code app.mail.enabled=true}.
 *
 * <p>Spring Boot 4 gates its own mail auto-configuration on
 * {@code spring.mail.host} being present, which makes the bean's existence
 * depend on an unrelated property and leaves {@link EmailService} with an
 * unsatisfied constructor dependency when mail is off. Declaring the sender
 * here makes the behaviour explicit and deterministic:
 *
 * <ul>
 *   <li>{@code app.mail.enabled=false} (local dev, the default) &rarr; no
 *       {@code JavaMailSender} bean at all, and {@link EmailService} resolves
 *       it through an {@code ObjectProvider} so it stays a silent no-op.</li>
 *   <li>{@code app.mail.enabled=true} &rarr; sender wired from
 *       {@code app.mail.*} and sends become active.</li>
 * </ul>
 *
 * <p>Boot's own {@code MailSenderAutoConfiguration} is excluded in
 * {@code application.properties} so it can never register a second sender.
 */
@Configuration
public class MailSenderConfig {

    @Bean
    @ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
    JavaMailSenderImpl mailSender(MailProperties props) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(props.getHost());
        sender.setPort(props.getPort());
        if (!props.getUsername().isBlank()) {
            sender.setUsername(props.getUsername());
        }
        if (!props.getPassword().isBlank()) {
            sender.setPassword(props.getPassword());
        }
        Properties javaMail = sender.getJavaMailProperties();
        javaMail.put("mail.transport.protocol", "smtp");
        javaMail.put("mail.smtp.auth", "true");
        javaMail.put("mail.smtp.starttls.enable", "true");
        javaMail.put("mail.smtp.starttls.required", "true");
        javaMail.put("mail.smtp.connectiontimeout", "5000");
        javaMail.put("mail.smtp.timeout", "5000");
        javaMail.put("mail.smtp.writetimeout", "5000");
        return sender;
    }
}
