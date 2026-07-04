package com.palscare.userservice.dto;

import com.palscare.userservice.model.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRegistrationRequest {
    @NotNull(message = "User type must be specified")
    private UserType userType;

    @NotNull(message = "Email must be specified")
    private String email;

    private String phone;

    @NotNull(message = "Password must be specified")
    private String password;

    @NotNull(message = "Name must be specified")
    private String name;
}
