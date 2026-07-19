package ut.edu.docuhub.admin;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.common.events.UserDeletedEvent;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;
import ut.edu.docuhub.common.security.CurrentUser;
import ut.edu.docuhub.user.UserRepository;
import ut.edu.docuhub.user.dto.UserDto;

/**
 * Quản trị người dùng. Phần quản trị tài liệu (/api/admin/documents) đã
 * chuyển sang document-service. Khi xoá user, thay vì dựa vào FK ON DELETE
 * CASCADE như thời monolith, phát sự kiện user.deleted để document-service
 * và chat-service tự dọn dữ liệu của user đó.
 */
@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public AdminUserService(UserRepository userRepository, ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDto::from);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (id.equals(CurrentUser.id())) {
            throw new IllegalArgumentException("Không thể tự xóa tài khoản admin đang đăng nhập");
        }
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }
        userRepository.deleteById(id);
        // Sự kiện Spring nội bộ; UserEventsRelay chỉ đẩy sang RabbitMQ SAU khi commit
        eventPublisher.publishEvent(new UserDeletedEvent(id));
    }
}
