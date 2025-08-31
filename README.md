# QR Scanner App

Ứng dụng này gồm 2 phần: Backend (Node.js/Express) và Frontend (React) cho phép quét các thiết bị trong mạng nội bộ, lấy mã QR tương ứng cho từng thiết bị và hiển thị chúng trên giao diện web.

## Tính năng chính
- Quét các IP trong dải mạng nội bộ, xác định thiết bị đang online.
- Lấy đường dẫn QR code cho từng thiết bị dựa trên IP.
- Hiển thị danh sách thiết bị online và mã QR tương ứng trên giao diện web.
- Cung cấp tài liệu API chuẩn OpenAPI/Swagger tại `/api-docs`.

## Cài đặt & Chạy ứng dụng

### Yêu cầu
- Docker & Docker Compose (khuyến nghị)
- Hoặc: Node.js >= 16, npm >= 8


### Chạy bằng Docker Compose
```bash
docker-compose up --build
```
- Truy cập ứng dụng tại: http://localhost:8080
- Mọi request `/scan` sẽ tự động được frontend (Nginx) chuyển tiếp sang backend, không cần mở port backend ra ngoài.


### Chạy thủ công (chỉ dùng cho phát triển local)
#### Backend
```bash
cd backend
npm install
npm start
```
Truy cập tài liệu API: http://localhost:3001/api-docs

#### Frontend
```bash
cd frontend
npm install
npm start
```
Truy cập frontend tại: http://localhost:3000


## API
- `GET /scan`: Quét mạng, trả về danh sách thiết bị online và QR code URL.
- Xem chi tiết cấu trúc response tại [backend/openapi.yaml](backend/openapi.yaml) hoặc http://localhost:8080/api-docs (khi chạy bằng Docker Compose)

## Cấu trúc thư mục
- `backend/`: Node.js Express server, tài liệu API, Dockerfile
- `frontend/`: React app, Dockerfile, cấu hình nginx


## Tài liệu API (Swagger UI)
- Khi chạy Docker Compose: http://localhost:8080/api-docs
- Khi chạy local: http://localhost:3001/api-docs
- File OpenAPI: [backend/openapi.yaml](backend/openapi.yaml)

---

## 🚀 Deploy nhanh bằng Docker Compose (không cần clone code)

Yêu cầu: Máy có Docker + Docker Compose.

```bash
# Tải file docker-compose.yml về
curl -O https://raw.githubusercontent.com/nguyenphong1996/qr_code/main/docker-compose.yml

# Kéo images từ GitHub Container Registry
docker compose pull

# Chạy ứng dụng
docker compose up -d
```

### Truy cập ứng dụng:
- Giao diện web: http://localhost:8080
- Tài liệu API (Swagger UI): http://localhost:8080/api-docs

## Liên kết image trên GitHub Container Registry (GHCR)
- [qr_code-backend:latest](https://github.com/nguyenphong1996/qr_code/pkgs/container/qr_code-backend)
- [qr_code-frontend:latest](https://github.com/nguyenphong1996/qr_code/pkgs/container/qr_code-frontend)

---

## Ghi chú
- Không cần build thủ công, chỉ cần Docker Compose là đủ.
- Nếu muốn cập nhật phiên bản mới nhất, chỉ cần pull lại repo và chạy lại lệnh `docker-compose up -d`.

## Tác giả
- Nguyễn Phong