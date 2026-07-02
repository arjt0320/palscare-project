package com.palscare.bookingservice.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GatewayUserPrincipal {
    private final String userId;
    private final String email;
    private final String role;
}
