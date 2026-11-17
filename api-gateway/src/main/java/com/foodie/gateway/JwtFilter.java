package com.foodie.gateway;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.*;
import org.springframework.core.Ordered;
import org.springframework.http.*;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/** Validates the JWT for every non-public call, enforces ADMIN for restaurant/menu writes, and forwards the identity downstream. */
@Component
public class JwtFilter implements GlobalFilter, Ordered {
  private final SecretKey key;
  public JwtFilter(@Value("${jwt.secret}") String secret){ key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }

  @Override public Mono<Void> filter(ServerWebExchange ex, GatewayFilterChain chain){
    ServerHttpRequest req = ex.getRequest(); String path = req.getURI().getPath();
    if (path.startsWith("/api/auth/") || req.getMethod() == HttpMethod.OPTIONS) return chain.filter(ex);
    String h = req.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
    if (h == null || !h.startsWith("Bearer ")) return deny(ex, HttpStatus.UNAUTHORIZED);
    try {
      Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(h.substring(7)).getPayload();
      String role = c.get("role", String.class);
      boolean write = path.startsWith("/api/restaurants") && req.getMethod() != HttpMethod.GET;
      if (write && !"ADMIN".equals(role)) return deny(ex, HttpStatus.FORBIDDEN);
      ServerHttpRequest r = req.mutate().headers(x -> { x.set("X-User-Email", c.getSubject()); x.set("X-User-Role", role); }).build();
      return chain.filter(ex.mutate().request(r).build());
    } catch (JwtException | IllegalArgumentException e) { return deny(ex, HttpStatus.UNAUTHORIZED); }
  }
  private Mono<Void> deny(ServerWebExchange ex, HttpStatus s){ ex.getResponse().setStatusCode(s); return ex.getResponse().setComplete(); }
  @Override public int getOrder(){ return -1; }
}
