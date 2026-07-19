package ut.edu.docuhub.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import ut.edu.docuhub.user.Role;
import ut.edu.docuhub.user.User;
import ut.edu.docuhub.user.UserRepository;

/**
 * Tạo sẵn tài khoản admin khi khởi động, cấu hình qua application.properties
 * (app.admin.*). Nếu email đã tồn tại thì nâng quyền ADMIN và đồng bộ lại họ
 * tên, không đụng tới mật khẩu hiện có — muốn đổi mật khẩu admin qua config
 * thì xóa user cũ trong DB (hoặc dùng chức năng quên mật khẩu).
 *
 * Tên mặc định đặt ở đây thay vì trong .properties vì Spring đọc file
 * .properties theo ISO-8859-1, tiếng Việt sẽ hỏng mã nếu không escape.
 */
@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private static final String DEFAULT_FULL_NAME = "Quản trị viên";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String email;

    @Value("${app.admin.password:}")
    private String password;

    @Value("${app.admin.full-name:}")
    private String fullName;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.info("Bỏ qua seed admin: chưa cấu hình app.admin.email / app.admin.password");
            return;
        }
        String name = StringUtils.hasText(fullName) ? fullName : DEFAULT_FULL_NAME;

        userRepository.findByEmail(email).ifPresentOrElse(existing -> {
            boolean changed = false;
            if (existing.getRole() != Role.ADMIN) {
                existing.setRole(Role.ADMIN);
                changed = true;
            }
            if (!name.equals(existing.getFullName())) {
                existing.setFullName(name);
                changed = true;
            }
            if (changed) {
                userRepository.save(existing);
                log.info("Đã cập nhật tài khoản admin có sẵn: {}", email);
            }
        }, () -> {
            User admin = new User();
            admin.setEmail(email);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setFullName(name);
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Đã tạo tài khoản admin: {}", email);
        });
    }
}
