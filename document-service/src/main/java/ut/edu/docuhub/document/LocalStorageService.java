package ut.edu.docuhub.document;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;

@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "doc", "docx", "ppt", "pptx", "txt");

    private final Path root;

    public LocalStorageService(@Value("${app.storage.local.dir}") String dir) {
        this.root = Path.of(dir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Không tạo được thư mục lưu trữ: " + root, e);
        }
    }

    @Override
    public UploadResult upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File rỗng");
        }
        String ext = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_EXT.contains(ext)) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ: " + ext);
        }
        String publicId = UUID.randomUUID() + "." + ext;
        Path target = root.resolve(publicId).normalize();
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Lỗi lưu file", e);
        }
        return new UploadResult(publicId, publicId, ext, file.getSize());
    }

    @Override
    public void delete(String publicId) {
        try {
            Files.deleteIfExists(resolveInsideRoot(publicId));
        } catch (IOException e) {
            throw new UncheckedIOException("Lỗi xóa file", e);
        }
    }

    @Override
    public Resource loadAsResource(String publicId) {
        try {
            Resource resource = new UrlResource(resolveInsideRoot(publicId).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Không tìm thấy file");
            }
            return resource;
        } catch (IOException e) {
            throw new UncheckedIOException("Lỗi đọc file", e);
        }
    }

    private Path resolveInsideRoot(String publicId) {
        Path resolved = root.resolve(publicId).normalize();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("Đường dẫn file không hợp lệ");
        }
        return resolved;
    }

    private String extensionOf(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase();
    }
}
