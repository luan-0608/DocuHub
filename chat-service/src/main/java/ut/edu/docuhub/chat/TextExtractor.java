package ut.edu.docuhub.chat;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.extractor.ExtractorFactory;
import org.apache.poi.extractor.POITextExtractor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/**
 * Trích text từ file để index RAG. Hỗ trợ pdf (PDFBox), txt (đọc thẳng),
 * doc/docx/ppt/pptx (Apache POI tự nhận diện định dạng);
 * loại khác trả rỗng → IndexingService bỏ qua.
 */
@Component
public class TextExtractor {

    public String extract(Resource resource, String fileType) {
        String type = fileType == null ? "" : fileType.toLowerCase();
        try (InputStream in = resource.getInputStream()) {
            return switch (type) {
                case "pdf" -> extractPdf(in);
                case "txt" -> new String(in.readAllBytes(), StandardCharsets.UTF_8);
                case "doc", "docx", "ppt", "pptx" -> extractOffice(in);
                default -> "";
            };
        } catch (IOException e) {
            throw new UncheckedIOException("Lỗi đọc file để index", e);
        }
    }

    private String extractPdf(InputStream in) throws IOException {
        try (PDDocument doc = Loader.loadPDF(in.readAllBytes())) {
            return new PDFTextStripper().getText(doc);
        }
    }

    private String extractOffice(InputStream in) throws IOException {
        try (POITextExtractor extractor = ExtractorFactory.createExtractor(in)) {
            return extractor.getText();
        }
    }
}
