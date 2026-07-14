package com.rainbowforest.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Cấu hình Rate Limiting (Tiêu chí 11).
 * Sử dụng Redis để quản lý Token Bucket.
 */
@Configuration
public class RateLimiterConfig {

    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            try {
                java.net.InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
                if (remoteAddress != null && remoteAddress.getAddress() != null) {
                    return Mono.just(remoteAddress.getAddress().getHostAddress());
                }
            } catch (Exception e) {
                // Tránh lỗi NullPointerException khiến Gateway trả về 400 Bad Request
            }
            return Mono.just("anonymous");
        };
    }
}
