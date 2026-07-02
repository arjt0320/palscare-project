package com.palscare.userservice.controller;

import com.palscare.userservice.dto.UserRegistrationRequest;
import com.palscare.userservice.model.User;
import com.palscare.userservice.security.GatewayUserPrincipal;
import com.palscare.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody UserRegistrationRequest request) {
        
        User user = userService.registerUser(principal.getUserId(), principal.getEmail(), request.getUserType());
        return ResponseEntity.ok(user);
    }
}
