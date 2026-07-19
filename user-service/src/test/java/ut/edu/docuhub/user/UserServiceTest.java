package ut.edu.docuhub.user;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import ut.edu.docuhub.common.security.CurrentUser;
import ut.edu.docuhub.user.dto.ChangePasswordRequest;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UserService userService;

    MockedStatic<CurrentUser> currentUser;

    @BeforeEach
    void setUp() {
        // Giả lập user id = 1 đang đăng nhập trong SecurityContext
        currentUser = mockStatic(CurrentUser.class);
        currentUser.when(CurrentUser::id).thenReturn(1L);
    }

    @AfterEach
    void tearDown() {
        currentUser.close();
    }

    private User user() {
        User user = new User();
        user.setEmail("sv@example.com");
        user.setPasswordHash("hashed-old");
        return user;
    }

    @Test
    void changePassword_success_updatesHash() {
        User user = user();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old123", "hashed-old")).thenReturn(true);
        when(passwordEncoder.encode("new123456")).thenReturn("hashed-new");

        assertThatCode(() -> userService.changePassword(new ChangePasswordRequest("old123", "new123456")))
                .doesNotThrowAnyException();

        verify(userRepository).save(user);
    }

    @Test
    void changePassword_wrongCurrentPassword_throws() {
        User user = user();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("sai-roi", "hashed-old")).thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword(new ChangePasswordRequest("sai-roi", "new123456")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Mật khẩu hiện tại không đúng");

        verify(userRepository, never()).save(user);
    }
}
