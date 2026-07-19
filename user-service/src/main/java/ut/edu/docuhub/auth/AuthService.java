package ut.edu.docuhub.auth;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.auth.dto.AuthResponse;
import ut.edu.docuhub.auth.dto.LoginRequest;
import ut.edu.docuhub.auth.dto.RegisterRequest;
import ut.edu.docuhub.auth.jwt.JwtService;
import ut.edu.docuhub.common.exception.DuplicateResourceException;
import ut.edu.docuhub.mail.MailService;
import ut.edu.docuhub.user.Role;
import ut.edu.docuhub.user.User;
import ut.edu.docuhub.user.UserRepository;
import ut.edu.docuhub.user.dto.UserDto;

@Service
public class AuthService {

    private static final long RESET_TOKEN_TTL_MINUTES = 60;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;
    private final String frontendUrl;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       MailService mailService,
                       @Value("${app.frontend-url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public UserDto register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateResourceException("Email đã được sử dụng");
        }
        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName());
        user.setRole(Role.USER);
        return UserDto.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = userRepository.findByEmail(req.email()).orElseThrow();
        String token = jwtService.generate(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, "Bearer", jwtService.getExpirationMs(), UserDto.from(user));
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setResetToken(UUID.randomUUID().toString());
            user.setResetExpires(LocalDateTime.now().plusMinutes(RESET_TOKEN_TTL_MINUTES));
            userRepository.save(user);
            // Gửi email chứa link đặt lại mật khẩu (bất đồng bộ, lỗi chỉ log)
            String resetLink = frontendUrl + "/reset-password?token=" + user.getResetToken();
            mailService.sendResetPasswordEmail(user.getEmail(), resetLink);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .filter(u -> u.getResetExpires() != null && u.getResetExpires().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ hoặc đã hết hạn"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetExpires(null);
        userRepository.save(user);
    }
}
