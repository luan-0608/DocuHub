package ut.edu.docuhub.chat.dto;

import java.util.List;

public record CreateSessionRequest(List<Long> documentIds, String title) {}
