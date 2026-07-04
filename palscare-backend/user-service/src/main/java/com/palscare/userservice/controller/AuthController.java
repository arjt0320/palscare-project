package com.palscare.userservice.controller;

import com.palscare.userservice.dto.*;
import com.palscare.userservice.model.User;
import com.palscare.userservice.model.UserType;
import com.palscare.userservice.repository.UserRepository;
import com.palscare.userservice.security.JwtUtils;
import com.palscare.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            User user = userService.registerUser(
                    request.getName(),
                    request.getEmail(),
                    request.getPhone(),
                    request.getPassword(),
                    request.getUserType()
            );
            String token = jwtUtils.generateToken(user);
            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .userId(user.getOktaUid())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .userType(user.getUserType().name())
                    .name(request.getName())
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        if (request.getUserType() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User role must be specified"));
        }

        User user = userRepository.findByIdentifierAndUserType(request.getIdentifier(), request.getUserType())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email/phone number or password"));
        }

        String name = "";
        try {
            if (user.getUserType() == UserType.PATIENT) {
                name = userService.getPatientProfile(user.getOktaUid()).getName();
            } else if (user.getUserType() == UserType.DOCTOR) {
                name = userService.getDoctorProfile(user.getOktaUid()).getName();
            }
        } catch (Exception e) {
            name = "User";
        }

        String token = jwtUtils.generateToken(user);
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .userId(user.getOktaUid())
                .email(user.getEmail())
                .phone(user.getPhone())
                .userType(user.getUserType().name())
                .name(name)
                .build();
        return ResponseEntity.ok(response);
    }
}
