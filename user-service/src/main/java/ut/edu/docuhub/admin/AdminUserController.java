package ut.edu.docuhub.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.common.dto.ApiResponse;
import ut.edu.docuhub.common.dto.PageResponse;
import ut.edu.docuhub.user.dto.UserDto;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ApiResponse<PageResponse<UserDto>> listUsers(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(adminUserService.listUsers(pageable)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ApiResponse.message("Đã xóa người dùng");
    }
}
