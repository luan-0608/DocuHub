package ut.edu.docuhub.document.dto;

import java.util.List;

/** Thống kê kho tài liệu của user: tổng số, dung lượng và phân bố theo môn học. */
public record DocumentStatsDto(long totalDocuments, long totalSize, List<SubjectCount> subjects) {

    public record SubjectCount(String name, long count) {
    }
}
