package com.foodie.auth;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Component
public class JwtUtil {
  private final SecretKey key;
  JwtUtil(@Value("${jwt.secret}") String s){ key = Keys.hmacShaKeyFor(s.getBytes(StandardCharsets.UTF_8)); }
  String create(User u){
    return Jwts.builder().subject(u.email).claim("role", u.role).claim("name", u.name)
      .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + 8 * 3600_000L)).signWith(key).compact();
  }
}
