package ut.edu.docuhub.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import ut.edu.docuhub.auth.dto.RegisterRequest;
import ut.edu.docuhub.auth.jwt.JwtService;
import ut.edu.docuhub.common.exception.DuplicateResourceException;
import ut.edu.docuhub.user.Role;
import ut.edu.docuhub.user.User;
import ut.edu.docuhub.user.UserRepository;
import ut.edu.docuhub.user.dto.UserDto;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;

    @InjectMocks AuthService authService;

    @Test
    void register_success_returnsUserWithRoleUser() {
        var req = new RegisterRequest("sv@example.com", "Pass@123", "Nguyễn Văn A");
        when(userRepository.existsByEmail(req.email())).thenReturn(false);
        when(passwordEncoder.encode(req.password())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDto result = authService.register(req);

        assertThat(result.email()).isEqualTo("sv@example.com");
        assertThat(result.role()).isEqualTo(Role.USER);
    }

    @Test
    void register_duplicateEmail_throws() {
        var req = new RegisterRequest("sv@example.com", "Pass@123", "Nguyễn Văn A");
        when(userRepository.existsByEmail(req.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(DuplicateResourceException.class);
    }
}
