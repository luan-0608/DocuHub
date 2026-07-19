package ut.edu.docuhub.chat;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.chat.dto.ChatAnswerDto;
import ut.edu.docuhub.chat.dto.ChatMessageDto;
import ut.edu.docuhub.chat.dto.ChatSessionDto;
import ut.edu.docuhub.chat.dto.CreateSessionRequest;
import ut.edu.docuhub.chat.dto.SendMessageRequest;
import ut.edu.docuhub.common.dto.ApiResponse;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionDto>> createSession(
            @RequestBody CreateSessionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(chatService.createSession(req), "Đã tạo phiên chat"));
    }

    @GetMapping("/sessions")
    public ApiResponse<List<ChatSessionDto>> listSessions() {
        return ApiResponse.ok(chatService.listSessions());
    }

    @DeleteMapping("/sessions/{id}")
    public ApiResponse<Void> deleteSession(@PathVariable Long id) {
        chatService.deleteSession(id);
        return ApiResponse.message("Đã xóa phiên chat");
    }

    @PostMapping("/sessions/{id}/documents/{documentId}")
    public ApiResponse<ChatSessionDto> addDocument(@PathVariable Long id,
                                                   @PathVariable Long documentId) {
        return ApiResponse.ok(chatService.addDocument(id, documentId), "Đã thêm tài liệu vào phiên chat");
    }

    @GetMapping("/sessions/{id}/messages")
    public ApiResponse<List<ChatMessageDto>> getMessages(@PathVariable Long id) {
        return ApiResponse.ok(chatService.getMessages(id));
    }

    @PostMapping("/sessions/{id}/messages")
    public ApiResponse<ChatAnswerDto> sendMessage(@PathVariable Long id,
                                                  @Valid @RequestBody SendMessageRequest req) {
        return ApiResponse.ok(chatService.sendMessage(id, req.content()));
    }
}
