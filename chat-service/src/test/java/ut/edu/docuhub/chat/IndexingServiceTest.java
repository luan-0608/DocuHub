package ut.edu.docuhub.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import ut.edu.docuhub.client.DocumentClient;
import ut.edu.docuhub.common.exception.AiServiceException;
import ut.edu.docuhub.common.internal.DocumentInfo;

@ExtendWith(MockitoExtension.class)
class IndexingServiceTest {

    @Mock DocumentClient documentClient;
    @Mock DocumentChunkRepository chunkRepository;
    @Mock TextExtractor textExtractor;
    @Mock EmbeddingService embeddingService;

    private IndexingService service() {
        return new IndexingService(documentClient, chunkRepository, textExtractor,
                embeddingService, 800, 100);
    }

    private DocumentInfo docInfo(long id, String type) {
        return new DocumentInfo(id, 1L, "Tài liệu " + id, "Môn học", type, false, null);
    }

    private FeignException.NotFound notFound() {
        Request request = Request.create(Request.HttpMethod.GET, "/internal/documents/99",
                Map.of(), null, StandardCharsets.UTF_8, new RequestTemplate());
        return new FeignException.NotFound("not found", request, null, Map.of());
    }

    @Test
    void index_savesChunksWithOwnerAndTitleThenMarksIndexed() {
        when(documentClient.getDocument(1L)).thenReturn(docInfo(1L, "txt"));
        when(documentClient.downloadFile(1L)).thenReturn("noi dung".getBytes());
        when(textExtractor.extract(any(Resource.class), eq("txt")))
                .thenReturn("Nội dung tài liệu để index");
        when(embeddingService.embed(anyString())).thenReturn(new float[] {0.1f, 0.2f});
        when(embeddingService.toJson(any())).thenReturn("[0.1,0.2]");

        service().index(1L);

        // Chunk phải mang owner_id + tên tài liệu denormalize để RAG khỏi gọi lại document-service
        ArgumentCaptor<DocumentChunk> chunk = ArgumentCaptor.forClass(DocumentChunk.class);
        verify(chunkRepository, times(1)).save(chunk.capture());
        assertThat(chunk.getValue().getOwnerId()).isEqualTo(1L);
        assertThat(chunk.getValue().getDocumentTitle()).isEqualTo("Tài liệu 1");
        verify(documentClient).markIndexed(1L);
    }

    @Test
    void index_emptyText_skipsAndNotMarkedIndexed() {
        when(documentClient.getDocument(2L)).thenReturn(docInfo(2L, "docx"));
        when(documentClient.downloadFile(2L)).thenReturn("x".getBytes());
        when(textExtractor.extract(any(Resource.class), eq("docx"))).thenReturn("");

        service().index(2L);

        verify(chunkRepository, never()).save(any());
        verify(documentClient, never()).markIndexed(anyLong());
    }

    @Test
    void index_documentDeletedMeanwhile_doesNothing() {
        when(documentClient.getDocument(99L)).thenThrow(notFound());

        service().index(99L);

        verify(documentClient, never()).downloadFile(anyLong());
        verify(chunkRepository, never()).save(any());
    }

    @Test
    void retryUnindexed_reindexesPendingAndClearsOldChunks() {
        when(documentClient.getUnindexed()).thenReturn(List.of(docInfo(7L, "txt")));
        when(documentClient.getDocument(7L)).thenReturn(docInfo(7L, "txt"));
        when(documentClient.downloadFile(7L)).thenReturn("noi dung".getBytes());
        when(textExtractor.extract(any(Resource.class), eq("txt")))
                .thenReturn("Nội dung tài liệu để index lại");
        when(embeddingService.embed(anyString())).thenReturn(new float[] {0.1f, 0.2f});
        when(embeddingService.toJson(any())).thenReturn("[0.1,0.2]");

        service().retryUnindexed();

        // Chunk dở dang của lần index gãy trước đó phải bị xóa trước khi lưu chunk mới
        verify(chunkRepository).deleteByDocumentId(7L);
        verify(chunkRepository, times(1)).save(any(DocumentChunk.class));
        verify(documentClient).markIndexed(7L);
    }

    @Test
    void retryUnindexed_aiServiceDown_stopsWithoutThrowing() {
        when(documentClient.getUnindexed())
                .thenReturn(List.of(docInfo(1L, "txt"), docInfo(2L, "txt")));
        when(documentClient.getDocument(1L)).thenReturn(docInfo(1L, "txt"));
        when(documentClient.downloadFile(1L)).thenReturn("noi dung".getBytes());
        when(textExtractor.extract(any(Resource.class), eq("txt"))).thenReturn("Nội dung");
        when(embeddingService.embed(anyString()))
                .thenThrow(new AiServiceException("Dịch vụ embedding không phản hồi"));

        service().retryUnindexed();

        // API AI đang chết thì dừng cả lượt — không thử tài liệu thứ hai cho đỡ tốn gọi
        verify(documentClient, never()).getDocument(2L);
        verify(documentClient, never()).markIndexed(anyLong());
    }

    @Test
    void retryUnindexed_documentServiceDown_skipsQuietly() {
        when(documentClient.getUnindexed()).thenThrow(new RuntimeException("connection refused"));

        service().retryUnindexed(); // không được ném exception — chờ lượt quét sau

        verify(chunkRepository, never()).save(any());
    }
}
