package ut.edu.docuhub.common.security;

/**
 * Danh tính người dùng lấy từ JWT, đặt vào SecurityContext bởi JwtAuthFilter.
 * Các service đọc userId/role thẳng từ đây, không cần gọi user-service.
 */
public record AuthPrincipal(Long id, String email, String role) {

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
