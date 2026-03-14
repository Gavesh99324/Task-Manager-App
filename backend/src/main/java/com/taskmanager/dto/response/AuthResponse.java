package com.taskmanager.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private String tokenType;
    private String userId;
    private String name;
    private String email;

    public static AuthResponse of(String token, String userId, String name, String email) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(userId)
                .name(name)
                .email(email)
                .build();
    }
}
