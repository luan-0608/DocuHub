package ut.edu.docuhub.chat.dto;

/**
 * Một nguồn [S#] mà câu trả lời AI đã trích dẫn.
 * chunkIndex hiển thị theo số thứ tự 1-based ("đoạn 4") cho khớp nhãn trong prompt.
 */
public record SourceRefDto(String label, Long documentId, String documentTitle,
                           int chunkIndex, String snippet) {}
