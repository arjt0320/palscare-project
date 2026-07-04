package com.palscare.userservice.security;

import com.palscare.userservice.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils {

    @Value("${palscare.jwt.secret:dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLXBhbHNjYXJlLWFwcGxpY2F0aW9uLXN5bW1ldHJpYy1rZXktc2hhMjU2}")
    private String jwtSecret;

    @Value("${palscare.jwt.expiration-ms:86400000}") // 24 hours
    private long jwtExpirationMs;

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("phone", user.getPhone());
        claims.put("user_type", user.getUserType().name());

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getOktaUid())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
