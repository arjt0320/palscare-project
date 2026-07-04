package com.palscare.userservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoginRequest {
    @NotNull(message = "Email or phone number must be specified")
    private String identifier;

    @NotNull(message = "Password must be specified")
    private String password;

    private com.palscare.userservice.model.UserType userType;
}
