package ut.edu.docuhub.auth.dto;

import ut.edu.docuhub.user.dto.UserDto;

public record AuthResponse(String accessToken, String tokenType, long expiresIn, UserDto user) {}
