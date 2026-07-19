package ut.edu.docuhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * user-service: đăng ký/đăng nhập (phát hành JWT), hồ sơ người dùng,
 * quản trị người dùng. Sở hữu database docuhub_user.
 */
@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
