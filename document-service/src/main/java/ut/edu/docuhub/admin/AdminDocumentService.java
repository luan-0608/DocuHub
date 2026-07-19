package ut.edu.docuhub.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.document.DocumentRepository;
import ut.edu.docuhub.document.dto.DocumentSummaryDto;

/** Phần quản trị tài liệu, tách ra từ AdminService monolith (phần users ở user-service). */
@Service
public class AdminDocumentService {

    private final DocumentRepository documentRepository;

    public AdminDocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public Page<DocumentSummaryDto> listDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable).map(DocumentSummaryDto::from);
    }
}
