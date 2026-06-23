package com.rainbowforest.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * RateLimiterConfig đã bị tắt trong môi trường dev vì không sử dụng Redis.
 * Nếu muốn bật lại Rate Limiting, hãy khởi động Redis và cấu hình lại application.yml.
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
