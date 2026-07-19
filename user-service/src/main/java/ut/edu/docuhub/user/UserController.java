package ut.edu.docuhub.user;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.common.dto.ApiResponse;
import ut.edu.docuhub.user.dto.ChangePasswordRequest;
import ut.edu.docuhub.user.dto.UpdateProfileRequest;
import ut.edu.docuhub.user.dto.UserDto;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ApiResponse<UserDto> me() {
        return ApiResponse.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ApiResponse<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.ok(userService.updateProfile(req), "Cập nhật thành công");
    }

    @PostMapping("/me/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(req);
        return ApiResponse.message("Đổi mật khẩu thành công");
    }
}
