package ut.edu.docuhub.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;
import ut.edu.docuhub.common.security.CurrentUser;
import ut.edu.docuhub.user.dto.ChangePasswordRequest;
import ut.edu.docuhub.user.dto.UpdateProfileRequest;
import ut.edu.docuhub.user.dto.UserDto;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getCurrentUserEntity() {
        // id lấy thẳng từ claim uid trong JWT (AuthPrincipal), không cần tra theo email
        return userRepository.findById(CurrentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    public UserDto getCurrentUser() {
        return UserDto.from(getCurrentUserEntity());
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest req) {
        User user = getCurrentUserEntity();
        user.setFullName(req.fullName());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest req) {
        User user = getCurrentUserEntity();
        // Phải xác nhận đúng mật khẩu hiện tại trước khi cho đổi
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }
}
