-- Nguon trich dan [S#] cua cau tra loi AI, luu dang JSON
-- (label, documentId, documentTitle, chunkIndex, snippet)
-- de UI hien tooltip va muc "Nguon trich dan" khi xem lai lich su
-- ma khong phai truy van lai document_chunks.
ALTER TABLE chat_messages ADD COLUMN sources TEXT NULL;
