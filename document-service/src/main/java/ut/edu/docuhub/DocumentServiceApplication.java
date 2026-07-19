package ut.edu.docuhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * document-service: CRUD tài liệu + lưu trữ file + quản trị tài liệu.
 * Sở hữu database docuhub_document. Chỉ giữ user_id dạng số (không FK) —
 * danh tính user nằm trong JWT, không cần gọi user-service.
 */
@SpringBootApplication
public class DocumentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DocumentServiceApplication.class, args);
    }
}
