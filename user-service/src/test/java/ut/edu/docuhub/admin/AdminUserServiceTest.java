package ut.edu.docuhub.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import ut.edu.docuhub.common.events.UserDeletedEvent;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;
import ut.edu.docuhub.common.security.AuthPrincipal;
import ut.edu.docuhub.user.Role;
import ut.edu.docuhub.user.User;
import ut.edu.docuhub.user.UserRepository;
import ut.edu.docuhub.user.dto.UserDto;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock UserRepository userRepository;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks AdminUserService adminUserService;

    @BeforeEach
    void loginAsAdminId1() {
        var principal = new AuthPrincipal(1L, "admin@x.com", "ADMIN");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private User userWithId(long id) {
        User u = new User();
        try {
            var f = User.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(u, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
        u.setEmail("u" + id + "@x.com");
        u.setFullName("U" + id);
        u.setRole(Role.USER);
        return u;
    }

    @Test
    void listUsers_mapsToDto() {
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(userWithId(1L))));

        var page = adminUserService.listUsers(pageable);

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0)).isInstanceOf(UserDto.class);
        assertThat(page.getContent().get(0).id()).isEqualTo(1L);
    }

    @Test
    void deleteUser_self_throws() {
        assertThatThrownBy(() -> adminUserService.deleteUser(1L))
                .isInstanceOf(IllegalArgumentException.class);
        verify(userRepository, never()).deleteById(org.mockito.ArgumentMatchers.any());
        verify(eventPublisher, never()).publishEvent(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deleteUser_other_deletesAndPublishesEvent() {
        when(userRepository.existsById(2L)).thenReturn(true);

        adminUserService.deleteUser(2L);

        verify(userRepository).deleteById(2L);
        verify(eventPublisher).publishEvent(new UserDeletedEvent(2L));
    }

    @Test
    void deleteUser_notFound_throws() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> adminUserService.deleteUser(99L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(eventPublisher, never()).publishEvent(org.mockito.ArgumentMatchers.any());
    }
}
