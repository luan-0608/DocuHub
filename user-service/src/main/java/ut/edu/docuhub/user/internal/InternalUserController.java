package ut.edu.docuhub.user.internal;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;
import ut.edu.docuhub.user.UserRepository;
import ut.edu.docuhub.user.dto.UserDto;

/**
 * API nội bộ cho các service khác (document-service, chat-service) tra cứu
 * thông tin người dùng khi cần hiển thị (vd: email chủ sở hữu tài liệu).
 * Được bảo vệ bằng header X-Internal-Token (xem SecurityConfig), không lộ qua gateway.
 */
@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final UserRepository userRepository;

    public InternalUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Long id) {
        return userRepository.findById(id).map(UserDto::from)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    @GetMapping
    public List<UserDto> getByIds(@RequestParam List<Long> ids) {
        return userRepository.findAllById(ids).stream().map(UserDto::from).toList();
    }
}
