
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
- Backend chạy ở: http://localhost:3001
- Frontend chạy ở: http://localhost:3000

### Chạy thủ công
#### Backend
```bash
cd backend
npm install
node server.js
```
Truy cập tài liệu API: http://localhost:3001/api-docs

#### Frontend
```bash
cd frontend
npm install
npm start
```

## API
- `GET /scan`: Quét mạng, trả về danh sách thiết bị online và QR code URL.
- Xem chi tiết cấu trúc response tại [backend/openapi.yaml](backend/openapi.yaml) hoặc http://localhost:3001/api-docs

## Cấu trúc thư mục
- `backend/`: Node.js Express server, tài liệu API, Dockerfile
- `frontend/`: React app, Dockerfile, cấu hình nginx

## Tài liệu API (Swagger UI)
- Đường dẫn: http://localhost:3001/api-docs
- File OpenAPI: [backend/openapi.yaml](backend/openapi.yaml)

## Tác giả
- Nguyễn Phong
