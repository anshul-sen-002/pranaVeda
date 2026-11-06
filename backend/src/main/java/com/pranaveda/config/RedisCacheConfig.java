package com.pranaveda.config;

import java.time.Duration;
import java.util.Map;

import com.pranaveda.dashboard.DashboardPageDto;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

import tools.jackson.databind.json.JsonMapper;

/** Redis cache settings for user-scoped dashboard page payloads. */
@Configuration
@EnableCaching
public class RedisCacheConfig {

    private static final Duration DASHBOARD_TTL = Duration.ofMinutes(5);

    @Bean
    @ConditionalOnExpression("'${REDIS_URL:}'.length() > 0")
    CacheManager cacheManager(RedisConnectionFactory connectionFactory, JsonMapper jsonMapper) {
        var dashboardSerializer = new JacksonJsonRedisSerializer<>(jsonMapper, DashboardPageDto.class);
        RedisCacheConfiguration dashboardCache = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(DASHBOARD_TTL)
            .serializeValuesWith(SerializationPair.fromSerializer(dashboardSerializer));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(dashboardCache)
            .withInitialCacheConfigurations(Map.of("dashboardSummary", dashboardCache))
            .build();
    }

    /** Keep local development usable when no Redis server is configured. */
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    CacheManager noRedisCacheManager() {
        return new NoOpCacheManager();
    }
}
