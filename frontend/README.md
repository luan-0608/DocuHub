# DocuHub – Frontend

> SPA React + TypeScript cho DocuHub (quản lý tài liệu + lưu trữ + chatbot AI). Tiêu thụ REST API backend dưới `/api`.

## 1. Stack
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 3** + UI kiểu shadcn (Radix primitives, `class-variance-authority`)
- **react-router-dom 7** (định tuyến) · **@tanstack/react-query 5** (data fetching/cache)
- **react-hook-form** + **zod** (form + validate) · **zustand** (auth store, có `persist`)
- **axios** (HTTP) · **sonner** (toast) · **react-markdown** (render câu trả lời AI) · **lucide-react** (icon)

## 2. Chạy dự án
```bash
cd frontend
npm install
npm run dev      # dev server (proxy /api → http://localhost:8080)
npm run build    # tsc -b && vite build
```
> Dev proxy khai báo trong `vite.config.ts`: mọi request `/api` được chuyển sang backend → cùng origin (đọc được header `content-disposition` khi tải file).

## 3. Cấu trúc thư mục
```
src/
  components/
    layout/AppShell.tsx     # header + nav + menu user (khung trang đã đăng nhập)
    ui/                     # primitives: button, card, dialog, input, badge, ...
  features/                 # tổ chức theo domain: api + schema + hooks + components
    auth/                   # store, ProtectedRoute, AdminRoute, hooks, schema
    documents/              # CRUD tài liệu + upload + download
    chat/                   # phiên chat + tin nhắn (RAG)
    admin/                  # quản trị người dùng/tài liệu
  pages/                    # trang theo route (auth, documents, chat, profile, admin)
  lib/                      # api (axios), types, format, utils, useDebounce
  router.tsx                # khai báo route
```
**Quy ước feature:** mỗi domain gói gọn `api.ts` (gọi REST) → `hooks.ts` (React Query) → `components/` (UI) → dùng ở `pages/`. Tuân thủ SRP/DRY, chỉ trừu tượng khi thực sự cần (KISS/YAGNI).

## 4. Tiện ích dùng chung (`lib/`)
- `api.ts` — instance axios (gắn JWT từ store) + `getApiError(err)` lấy message lỗi từ `ApiResponse`.
- `types.ts` — type khớp DTO backend: `ApiResponse<T>`, `PageResponse<T>`, `User`, `DocumentItem/Summary`, `ChatSession/Message/Answer`.
- `format.ts` — `formatDate`, `formatFileSize`. · `useDebounce` — debounce ô tìm kiếm.

## 5. Định tuyến & phân quyền (`router.tsx`)
| Route | Trang | Bảo vệ |
|---|---|---|
| `/login` `/register` `/forgot-password` `/reset-password` | Auth | Public |
| `/documents` `/documents/:id` | Tài liệu | `ProtectedRoute` (cần token) |
| `/chat` `/chat/:sessionId` | Trợ lý AI | `ProtectedRoute` |
| `/profile` | Hồ sơ | `ProtectedRoute` |
| `/admin` | Quản trị | `ProtectedRoute` + `AdminRoute` (role `ADMIN`) |

- `ProtectedRoute` — chưa có token → chuyển `/login`.
- `AdminRoute` — role ≠ `ADMIN` → chuyển `/documents`. Mục nav "Quản trị" chỉ hiện với ADMIN.
- Gate ở client chỉ phục vụ UX; backend vẫn là lớp chặn thật theo role.

## 6. Tính năng & ánh xạ API
| Tính năng | Backend | Ghi chú frontend |
|---|---|---|
| Đăng nhập/ký/quên mật khẩu | `/api/auth/*` | JWT lưu zustand `persist` (`docuhub-auth`) |
| Hồ sơ | `GET/PUT /api/users/me` | Sửa họ tên, đồng bộ lại store |
| Tài liệu | `GET/POST/PUT/DELETE /api/documents` | Tìm kiếm (debounce) + lọc môn học + phân trang |
| Tải xuống | `GET /api/documents/{id}/download` | Stream blob → tải file, đọc tên từ `content-disposition` |
| Chatbot (RAG) | `/api/chat/sessions...` | **Optimistic**: hiện tin user ngay, refetch lấy câu trả lời AI; Markdown |
| Quản trị | `GET /api/admin/users`, `DELETE /api/admin/users/{id}`, `GET /api/admin/documents` | Bảng + phân trang; chặn tự xóa tài khoản đang đăng nhập |

## 7. Quy ước code (tsconfig strict)
- `verbatimModuleSyntax` → bắt buộc `import type` cho type-only import.
- `noUnusedLocals/Parameters` → tham số không dùng đặt tiền tố `_`.
- `erasableSyntaxOnly` → **không** dùng enum/namespace (dùng union type).
- Path alias `@/* → src/*`. Style: không dấu `;`, nháy đơn, indent 2 space.

## 8. Tham chiếu
- Kiến trúc tổng thể, hướng dẫn chạy toàn hệ thống: [`../README.md`](../README.md)
