package ut.edu.docuhub.document;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

/**
 * Test CloudinaryStorageService với SDK giả (mock) — không gọi mạng thật.
 * Phần sinh URL ký số (loadAsResource) thuộc SDK nên không test ở đây.
 */
class CloudinaryStorageServiceTest {

    private Cloudinary cloudinary;
    private Uploader uploader;
    private CloudinaryStorageService service;

    @BeforeEach
    void setUp() {
        cloudinary = mock(Cloudinary.class);
        uploader = mock(Uploader.class);
        service = new CloudinaryStorageService(cloudinary);
    }

    @Test
    void upload_sendsRawResourceWithDocuhubFolder_andReturnsCloudinaryIds() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "bai-giang.pdf", "application/pdf", "noi dung".getBytes());
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of(
                "secure_url", "https://res.cloudinary.com/demo/raw/upload/docuhub/abc.pdf",
                "public_id", "docuhub/abc.pdf"));

        UploadResult result = service.upload(file);

        assertThat(result.url()).isEqualTo("https://res.cloudinary.com/demo/raw/upload/docuhub/abc.pdf");
        assertThat(result.publicId()).isEqualTo("docuhub/abc.pdf");
        assertThat(result.type()).isEqualTo("pdf");
        assertThat(result.size()).isEqualTo(file.getSize());

        @SuppressWarnings("rawtypes")
        ArgumentCaptor<Map> params = ArgumentCaptor.forClass(Map.class);
        verify(uploader).upload(any(byte[].class), params.capture());
        // Tài liệu không phải ảnh: bắt buộc resource_type=raw, public_id trong thư mục docuhub kèm đuôi file
        assertThat(params.getValue()).containsEntry("resource_type", "raw");
        assertThat((String) params.getValue().get("public_id")).startsWith("docuhub/").endsWith(".pdf");
    }

    @Test
    void upload_unsupportedExtension_rejectsBeforeCallingCloudinary() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "virus.exe", "application/octet-stream", new byte[] {1});

        assertThatThrownBy(() -> service.upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("không được hỗ trợ");
        verify(cloudinary, never()).uploader();
    }

    @Test
    void delete_destroysAsRawResource() throws Exception {
        when(cloudinary.uploader()).thenReturn(uploader);

        service.delete("docuhub/abc.pdf");

        @SuppressWarnings("rawtypes")
        ArgumentCaptor<Map> params = ArgumentCaptor.forClass(Map.class);
        verify(uploader).destroy(eq("docuhub/abc.pdf"), params.capture());
        assertThat(params.getValue()).containsEntry("resource_type", "raw");
    }
}
