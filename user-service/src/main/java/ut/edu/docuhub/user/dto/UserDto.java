package ut.edu.docuhub.user.dto;

import java.time.LocalDateTime;
import ut.edu.docuhub.user.Role;
import ut.edu.docuhub.user.User;

public record UserDto(Long id, String email, String fullName, Role role, LocalDateTime createdAt) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getCreatedAt());
    }
}
