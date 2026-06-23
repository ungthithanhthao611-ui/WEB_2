package com.rainbowforest.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.util.List;

/**
 * Filter bảo mật JWT cho API Gateway.
 * Kiểm tra Token đính kèm ở Authorization Header (Bearer <token>).
 * Giải mã, kiểm tra tính hợp lệ và check phân quyền truy cập (Role-based).
 */
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    // Lấy secret key dùng chung từ file cấu hình của Gateway
    @Value("${jwt.secret}")
    private String jwtSecret;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {
        private List<String> requiredRoles;

        public List<String> getRequiredRoles() {
            return requiredRoles;
        }

        public void setRequiredRoles(List<String> requiredRoles) {
            this.requiredRoles = requiredRoles;
        }
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return List.of("requiredRoles");
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 1. Kiểm tra sự tồn tại của header Authorization
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Thiếu header Authorization - Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Header Authorization không đúng định dạng Bearer Token", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // 2. Xác thực token JWT bằng signing key đã cấu hình
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(getSigningKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();
                String role = claims.get("role", String.class);

                // 3. Phân quyền truy cập dựa trên cấu hình Route (Ví dụ: Route Admin chỉ chấp nhận role ADMIN)
                if (config.getRequiredRoles() != null && !config.getRequiredRoles().isEmpty()) {
                    // Chuẩn hóa role của người dùng (bỏ tiền tố "ROLE_" nếu có để so khớp chính xác)
                    final String cleanUserRole = (role != null && role.toUpperCase().startsWith("ROLE_")) 
                            ? role.substring(5) 
                            : role;

                    boolean hasRole = config.getRequiredRoles().stream()
                            .map(r -> r.toUpperCase().startsWith("ROLE_") ? r.substring(5) : r)
                            .anyMatch(r -> r.equalsIgnoreCase(cleanUserRole));
                            
                    if (!hasRole) {
                        return onError(exchange, "Quyền truy cập bị từ chối - Bạn không có quyền truy cập chức năng này", HttpStatus.FORBIDDEN);
                    }
                }

                // 4. Gắn thêm thông tin User và Role vào header của request đi xuống các microservices con (Downstream)
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Name", username)
                        .header("X-User-Roles", role)
                        .build();

                // Tiếp tục chuỗi filter định tuyến
                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                return onError(exchange, "Token đã hết hạn hoặc không hợp lệ", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        
        // Trả về mã lỗi HTTP tương ứng (401 Unauthorized / 403 Forbidden)
        return response.setComplete();
    }
}
