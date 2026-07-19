package ut.edu.docuhub.document.dto;

import jakarta.validation.constraints.NotBlank;

public record DocumentUpdateRequest(@NotBlank String title, String description, String subject) {}
