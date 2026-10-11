package com.pranaveda.mail;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Dedicated, bounded thread pool for outbound email.
 *
 * <p>Email runs off the request thread so login latency is unaffected, but the
 * pool is intentionally small: if SMTP is slow/down, queued sends pile up in a
 * bounded queue and are discarded (CallerRunsPolicy avoided on purpose so the
 * caller is never blocked by a stuck mail server). This bounds resource use and
 * keeps a mail outage from taking the API down with it.
 */
@Configuration
@EnableAsync
public class MailExecutorConfig {

    @Bean("mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("mail-");
        // If the queue is full, drop the task rather than block the request
        // thread or throw into the async caller (email is best-effort).
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardPolicy());
        executor.initialize();
        return executor;
    }
}
