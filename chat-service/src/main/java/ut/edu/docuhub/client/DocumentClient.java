package ut.edu.docuhub.client;

import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import ut.edu.docuhub.common.internal.DocumentInfo;

/**
 * Gọi API nội bộ của document-service (tra qua Eureka theo tên service,
 * KHÔNG đi qua gateway). FeignConfig tự gắn header X-Internal-Token.
 */
@FeignClient(name = "document-service")
public interface DocumentClient {

    @GetMapping("/internal/documents/{id}")
    DocumentInfo getDocument(@PathVariable("id") Long id);

    @GetMapping("/internal/documents")
    List<DocumentInfo> getDocuments(@RequestParam("ids") List<Long> ids);

    @GetMapping("/internal/documents/unindexed")
    List<DocumentInfo> getUnindexed();

    @GetMapping("/internal/documents/{id}/file")
    byte[] downloadFile(@PathVariable("id") Long id);

    @PutMapping("/internal/documents/{id}/indexed")
    void markIndexed(@PathVariable("id") Long id);

    @PutMapping("/internal/documents/{id}/summary")
    void updateSummary(@PathVariable("id") Long id, @RequestBody UpdateSummaryRequest body);
}
