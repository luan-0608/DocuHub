package ut.edu.docuhub.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Tiện ích đọc danh tính hiện tại từ SecurityContext (do JwtAuthFilter đặt vào). */
public final class CurrentUser {

    private CurrentUser() {}

    public static AuthPrincipal get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthPrincipal principal) {
            return principal;
        }
        throw new IllegalStateException("Chưa xác thực — không có danh tính trong SecurityContext");
    }

    public static Long id() {
        return get().id();
    }
}
