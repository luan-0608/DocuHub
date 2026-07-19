package ut.edu.docuhub.document;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Lưu file lên Cloudinary (cloud storage). Bật bằng app.storage.provider=cloudinary
 * + biến CLOUDINARY_URL dạng cloudinary://api_key:api_secret@cloud_name.
 *
 * Tài liệu (pdf/docx/ppt...) không phải ảnh nên upload với resource_type=raw.
 * Tải về đi qua URL ký số (signed) — vượt qua hạn chế chặn PDF/ZIP công khai
 * mà Cloudinary bật mặc định cho tài khoản mới.
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "cloudinary")
public class CloudinaryStorageService implements StorageService {

    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "doc", "docx", "ppt", "pptx", "txt");
    /** Thư mục ảo trên Cloudinary để tách file của app khỏi tài nguyên khác trong tài khoản. */
    private static final String FOLDER = "docuhub";

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryStorageService(@Value("${app.storage.cloudinary.url}") String cloudinaryUrl) {
        if (!StringUtils.hasText(cloudinaryUrl)) {
            throw new IllegalStateException(
                    "app.storage.provider=cloudinary nhưng thiếu CLOUDINARY_URL "
                    + "(dạng cloudinary://api_key:api_secret@cloud_name — lấy ở Dashboard Cloudinary)");
        }
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    /** Cho unit test cắm Cloudinary giả. */
    CloudinaryStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
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
        // Tự đặt public_id (kèm đuôi file, Cloudinary khuyến nghị với raw) thay vì để sinh ngẫu nhiên
        String publicId = FOLDER + "/" + UUID.randomUUID() + "." + ext;
        try {
            Map<?, ?> res = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "raw",
                    "public_id", publicId));
            return new UploadResult((String) res.get("secure_url"), (String) res.get("public_id"),
                    ext, file.getSize());
        } catch (IOException e) {
            throw new UncheckedIOException("Lỗi tải file lên Cloudinary", e);
        }
    }

    @Override
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", "raw",
                    "invalidate", true));
        } catch (IOException e) {
            throw new UncheckedIOException("Lỗi xóa file trên Cloudinary", e);
        }
    }

    @Override
    public Resource loadAsResource(String publicId) {
        String url = cloudinary.url()
                .resourceType("raw")
                .secure(true)
                .signed(true)
                .generate(publicId);
        try {
            // UrlResource chỉ mở stream khi đọc — service stream thẳng từ Cloudinary về client
            return new UrlResource(url);
        } catch (MalformedURLException e) {
            throw new UncheckedIOException("URL Cloudinary không hợp lệ: " + url, e);
        }
    }

    private String extensionOf(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase();
    }
}
