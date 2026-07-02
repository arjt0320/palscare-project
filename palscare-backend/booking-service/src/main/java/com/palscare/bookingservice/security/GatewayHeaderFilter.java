package com.palscare.bookingservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class GatewayHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        String userRole = request.getHeader("X-User-Role");
        String userEmail = request.getHeader("X-User-Email");

        System.out.println("Booking-Service GatewayHeaderFilter - Received headers: X-User-Id=" + userId + ", X-User-Role=" + userRole + ", X-User-Email=" + userEmail);

        if (userId != null && userRole != null) {
            String authority = "ROLE_" + userRole.toUpperCase();
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(authority));
            System.out.println("Booking-Service GatewayHeaderFilter - Setting SecurityContext with authority: " + authority);

            GatewayUserPrincipal principal = new GatewayUserPrincipal(userId, userEmail, userRole);
            PreAuthenticatedAuthenticationToken authentication = new PreAuthenticatedAuthenticationToken(
                    principal, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            System.out.println("Booking-Service GatewayHeaderFilter - Missing X-User-Id or X-User-Role. Request remains unauthenticated.");
        }

        filterChain.doFilter(request, response);
    }
}
