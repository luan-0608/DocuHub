package ut.edu.docuhub.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.auth.dto.AuthResponse;
import ut.edu.docuhub.auth.dto.ForgotPasswordRequest;
import ut.edu.docuhub.auth.dto.LoginRequest;
import ut.edu.docuhub.auth.dto.RegisterRequest;
import ut.edu.docuhub.auth.dto.ResetPasswordRequest;
import ut.edu.docuhub.common.dto.ApiResponse;
import ut.edu.docuhub.user.dto.UserDto;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest req) {
        UserDto user = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(user, "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req), "Đăng nhập thành công");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.email());
        return ApiResponse.message("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được tạo");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
        return ApiResponse.message("Đổi mật khẩu thành công");
    }
}
