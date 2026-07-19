-- Database rieng cua chat-service.
-- user_id, document_id, owner_id la ID ben user-service/document-service:
-- KHONG co FOREIGN KEY sang bang cua service khac (database-per-service).
-- Don du lieu khi xoa user/tai lieu duoc xu ly bang su kien qua RabbitMQ.

CREATE TABLE chat_sessions (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    title      VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_user (user_id)
);

CREATE TABLE chat_messages (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    role       VARCHAR(20) NOT NULL,
    content    TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_session FOREIGN KEY (session_id)
        REFERENCES chat_sessions (id) ON DELETE CASCADE
);

-- Bang phu cua @ElementCollection ChatSession.documentIds
CREATE TABLE chat_session_documents (
    session_id  BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    PRIMARY KEY (session_id, document_id),
    CONSTRAINT fk_csd_session FOREIGN KEY (session_id)
        REFERENCES chat_sessions (id) ON DELETE CASCADE
);

-- owner_id + document_title denormalize tu document-service luc index
-- de truy xuat RAG va gan nhan nguon khong phai goi service khac
CREATE TABLE document_chunks (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id    BIGINT NOT NULL,
    owner_id       BIGINT NOT NULL,
    document_title VARCHAR(255) NOT NULL,
    chunk_index    INT NOT NULL,
    content        TEXT NOT NULL,
    embedding      TEXT NOT NULL,
    INDEX idx_chunk_document (document_id),
    INDEX idx_chunk_owner (owner_id)
);
