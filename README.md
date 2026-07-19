# DocuHub — Nền tảng quản lý tài liệu học tập tích hợp AI

DocuHub là ứng dụng web quản lý **tài liệu học tập** (PDF / DOCX / TXT) kèm **trợ lý AI
hỏi–đáp trực tiếp trên tài liệu đã tải lên** (RAG — câu trả lời có trích dẫn nguồn),
xây dựng theo kiến trúc **SOA / Microservices** với Spring Boot 3 + Spring Cloud,
frontend React, đóng gói và chạy toàn bộ bằng **Docker Compose**.

## ✨ Tính năng chính

- **Tài khoản**: đăng ký / đăng nhập (JWT), hồ sơ cá nhân, đổi mật khẩu,
  quên mật khẩu qua email (SMTP).
- **Tài liệu**: tải lên PDF/DOCX/TXT, tìm kiếm, lọc theo môn học, phân trang,
  tải xuống, thống kê; lưu file **local** (volume Docker) hoặc **Cloudinary**.
- **Trợ lý AI (RAG)**: hỏi đáp dựa trên chính tài liệu đã upload — câu trả lời kèm
  chip nguồn **[S#]**, di chuột xem trích đoạn gốc; tóm tắt tài liệu bằng AI;
  kéo-thả tài liệu vào phiên chat.
- **Quản trị (ADMIN)**: quản lý người dùng và tài liệu toàn hệ thống.
- **Xử lý nền** qua RabbitMQ: upload xong tự động trích văn bản → cắt đoạn →
  tạo embedding → lập chỉ mục phục vụ RAG.

## 🏗 Kiến trúc

```
Frontend (React + nginx :3000)
        │  /api/**
        ▼
API Gateway :8080 (Spring Cloud Gateway — route, kiểm tra JWT, CORS)
        │ lb:// qua Eureka
        ├────────────────────┬─────────────────────┐
        ▼                    ▼                     ▼
user-service :8081    document-service :8082   chat-service :8083
auth + user + admin   upload/tìm kiếm/thống kê  RAG chat + tóm tắt AI
MySQL docuhub_user    MySQL docuhub_document    MySQL docuhub_chat
(host :3307)          (host :3308)              (host :3309)

Hạ tầng chung: Eureka :8761 (service discovery) — RabbitMQ :5672 / UI :15672
Event (topic exchange docuhub.events): document.uploaded, document.deleted, user.deleted
```

- **Database-per-service**: 3 MySQL riêng biệt, các service không chạm database của nhau.
- Giao tiếp **đồng bộ** qua OpenFeign (REST + Eureka client-side load balancing),
  **bất đồng bộ** qua RabbitMQ (event-driven, eventual consistency).
- API Gateway là điểm vào duy nhất, xác thực JWT sớm; từng service vẫn tự xác thực
  lại (defense in depth). API nội bộ `/internal/**` bảo vệ bằng header `X-Internal-Token`.

## 🧰 Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot 3.5, Spring Cloud 2025 (Gateway, Eureka, OpenFeign), Spring Security + JWT (jjwt), JPA/Hibernate, Flyway, springdoc-openapi |
| Trích văn bản | Apache PDFBox (PDF), Apache POI (DOCX) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, react-hook-form + zod, zustand |
| AI | Endpoint tương thích chuẩn OpenAI (embeddings + chat completions), hỗ trợ Gemini |
| Hạ tầng | Docker Compose (10 container), MySQL 8.4, RabbitMQ 3.13, nginx |

## 📁 Cấu trúc repo (Maven multi-module)

| Module | Vai trò | Cổng |
|---|---|---|
| `common-lib` | Thư viện dùng chung: JWT, ApiResponse, event contract (không phải service) | — |
| `discovery-server` | Eureka service registry | 8761 |
| `api-gateway` | Cổng vào duy nhất, route + xác thực JWT sớm | 8080 |
| `user-service` | Đăng ký/đăng nhập, hồ sơ, quản trị user, cấp JWT, gửi email | 8081 |
| `document-service` | Upload/tìm kiếm/tải tài liệu, thống kê, lưu file | 8082 |
| `chat-service` | RAG chatbot, index embedding, tóm tắt AI | 8083 |
| `frontend/` | React + Vite + TypeScript (chạy production qua nginx) | 3000 |

---

# 🚀 Hướng dẫn cài đặt & chạy

## 1. Yêu cầu máy

- **Docker Desktop** đã cài và đang chạy (Windows / macOS / Linux).
- Các cổng sau đang trống: `3000, 8080, 8761, 8081, 8082, 8083, 3307, 3308, 3309, 5672, 15672`.
- Lần chạy đầu cần internet để tải image và thư viện (khoảng 5–10 phút).
- (Chỉ khi chạy dev ngoài Docker: JDK 21 + Node.js 20+.)

## 2. Tải mã nguồn & cấu hình

```bash
git clone <URL-repo-cua-ban>
cd duanhdt
```

Tạo file cấu hình từ mẫu:

```bash
# Windows (PowerShell/CMD)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Hệ thống **chạy được ngay với giá trị dev mặc định**, chỉ nhóm cấu hình sau cần điền thêm:

| Nhóm biến trong `.env` | Bắt buộc? | Ý nghĩa |
|---|---|---|
| `EMBEDDING_API_KEY`, `LLM_API_KEY` (+ `*_BASE_URL`, `*_MODEL`) | **Có, nếu muốn dùng tính năng AI** (chat, tóm tắt, lập chỉ mục). Dùng key OpenAI hoặc bất kỳ endpoint tương thích chuẩn OpenAI | AI cho chat-service |
| `SMTP_USER`, `SMTP_PASS` | Không — để trống thì chỉ không gửi được email đặt lại mật khẩu | Gmail + App Password ([tạo tại đây](https://myaccount.google.com/apppasswords)) |
| `STORAGE_PROVIDER`, `CLOUDINARY_URL` | Không — mặc định `local` lưu vào volume Docker | Đổi `cloudinary` để lưu file lên cloud |
| `JWT_SECRET`, `INTERNAL_TOKEN`, `DB_PASS`, `RABBITMQ_*`, `ADMIN_*` | Dev thì dùng mặc định được; **production phải đổi hết** | Secret hệ thống |

## 3. Chạy hệ thống

```bash
docker compose up --build -d
```

Theo dõi đến khi tất cả service `healthy` (lần đầu build Maven trong Docker nên hơi lâu):

```bash
docker compose ps
```

Các địa chỉ truy cập:

| Địa chỉ | Là gì |
|---|---|
| http://localhost:3000 | **Giao diện web** (nginx proxy `/api` → gateway) |
| http://localhost:8080 | API Gateway |
| http://localhost:8761 | Dashboard Eureka (xem service đã đăng ký) |
| http://localhost:15672 | RabbitMQ UI — đăng nhập `docuhub` / `docuhub` |
| http://localhost:8081/swagger-ui.html | Swagger user-service |
| http://localhost:8082/swagger-ui.html | Swagger document-service |
| http://localhost:8083/swagger-ui.html | Swagger chat-service |

Tài khoản admin seed sẵn (dev): **admin@docuhub.vn / admin123**
(đổi qua biến `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`).

Dừng hệ thống:

```bash
docker compose down        # giữ dữ liệu
docker compose down -v     # xóa luôn dữ liệu (database, file đã tải lên)
```

Demo scale một service:

```bash
docker compose up --scale document-service=2 -d
```

## 4. Luồng dùng thử nhanh

1. Mở http://localhost:3000 → đăng nhập admin hoặc đăng ký tài khoản mới.
2. Vào **Tài liệu** → tải lên file PDF/DOCX/TXT.
3. Chờ vài giây đến khi tài liệu chuyển trạng thái **"Đã lập chỉ mục"**
   (xử lý nền qua RabbitMQ: trích văn bản → cắt đoạn → tạo embedding).
4. Bấm **"Hỏi AI về tài liệu này"** → đặt câu hỏi; câu trả lời có chip nguồn **[S#]**,
   cuối câu trả lời có mục **"Nguồn trích dẫn"**.
5. Thử thêm: tóm tắt AI trong trang chi tiết tài liệu, kéo-thả tài liệu vào panel chat,
   trang Hồ sơ có **Đổi mật khẩu**, trang Quản trị (tài khoản admin).

## 5. Chạy dev (backend ngoài Docker)

Chỉ bật hạ tầng bằng Docker, service chạy bằng IDE / Maven để debug nhanh:

```bash
# 1. Hạ tầng: 3 MySQL + RabbitMQ + Eureka
docker compose up -d mysql-user mysql-document mysql-chat rabbitmq discovery-server

# 2. Từng service (mỗi cái một terminal) — cấu hình mặc định đã trỏ localhost:3307-3309
.\mvnw.cmd -pl api-gateway spring-boot:run
.\mvnw.cmd -pl user-service spring-boot:run
.\mvnw.cmd -pl document-service spring-boot:run
.\mvnw.cmd -pl chat-service spring-boot:run

# 3. Frontend dev server (vite proxy /api -> localhost:8080)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

> macOS/Linux dùng `./mvnw` thay cho `.\mvnw.cmd`.

## 6. Build & test

```bash
.\mvnw.cmd verify
```

Build 7 module và chạy toàn bộ unit test (H2 in-memory — không cần MySQL/RabbitMQ/AI thật):
47 test — api-gateway 8, user-service 9, document-service 7, chat-service 23.

## 7. Khắc phục sự cố thường gặp

- **Windows không bind được cổng 15672** (RabbitMQ UI) do nằm trong dải port hệ điều hành
  reserve: tạo file `docker-compose.override.yml` (đã gitignore) map sang cổng khác:

  ```yaml
  services:
    rabbitmq:
      ports: !override
        - "5672:5672"
        - "16672:15672"   # UI -> http://localhost:16672
  ```

- **Container chưa `healthy` / frontend chưa mở được**: lần đầu build khá lâu,
  chạy `docker compose ps` và `docker compose logs -f <service>` để theo dõi.
- **Tính năng AI báo "Chưa cấu hình API key"**: điền `EMBEDDING_API_KEY` / `LLM_API_KEY`
  trong `.env` rồi chạy `docker compose up -d chat-service`.

## 8. Ghi chú kỹ thuật

- JWT HS256 (secret Base64 dùng chung), bắt buộc claim `uid` — gateway chặn sớm,
  từng service vẫn tự xác thực lại (defense in depth).
- API nội bộ `/internal/**` giữa các service bảo vệ bằng header `X-Internal-Token`,
  không đi qua gateway.
- Xóa user/tài liệu lan truyền qua event RabbitMQ (eventual consistency — dữ liệu
  liên quan biến mất sau vài giây).
- `chat-service` denormalize `owner_id` + `document_title` vào bảng `document_chunks`
  lúc index để truy vấn RAG không phải gọi service khác.
- Mọi cấu hình nhạy cảm đọc từ biến môi trường (12-factor), xem
  [`.env.example`](.env.example). File `.env` đã được gitignore —
  **không bao giờ commit `.env`; production phải đổi toàn bộ secret mặc định**.
