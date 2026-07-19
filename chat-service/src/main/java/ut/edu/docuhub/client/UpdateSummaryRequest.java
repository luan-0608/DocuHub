package ut.edu.docuhub.client;

/** Body cho PUT /internal/documents/{id}/summary (khớp UpdateSummaryBody phía document-service). */
public record UpdateSummaryRequest(String summary) {}
