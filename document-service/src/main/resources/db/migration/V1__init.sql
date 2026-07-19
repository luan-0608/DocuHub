-- Database rieng cua document-service.
-- user_id la ID ben user-service: KHONG co FOREIGN KEY vi khac database
-- (nguyen tac database-per-service). Viec don du lieu khi xoa user duoc
-- xu ly bang su kien user.deleted qua RabbitMQ.
CREATE TABLE documents (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    subject        VARCHAR(100),
    file_url       VARCHAR(500) NOT NULL,
    file_public_id VARCHAR(255) NOT NULL,
    file_type      VARCHAR(50),
    file_size      BIGINT,
    indexed        BOOLEAN NOT NULL DEFAULT FALSE,
    summary        TEXT,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_doc_user (user_id),
    INDEX idx_doc_subject (subject)
);
