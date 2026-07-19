package ut.edu.docuhub.document;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Trừu tượng nơi lưu file. Hiện dùng LocalStorageService; sau thay bằng Cloudinary
 * chỉ cần thêm impl mới mà không sửa DocumentService.
 */
public interface StorageService {

    UploadResult upload(MultipartFile file);

    void delete(String publicId);

    Resource loadAsResource(String publicId);
}
