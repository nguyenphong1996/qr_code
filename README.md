# QR Scanner App

Ứng dụng gồm Backend (Node.js/Express) và Frontend (React) cho phép quét các thiết bị trong mạng nội bộ, lấy mã QR tương ứng cho từng thiết bị và hiển thị trên giao diện web.

## Tính năng chính
- Quét các IP trong dải mạng nội bộ, xác định thiết bị đang online.
- Lấy đường dẫn QR code cho từng thiết bị dựa trên IP.
- Hiển thị danh sách thiết bị online và mã QR tương ứng trên giao diện web.
- Cung cấp tài liệu API chuẩn OpenAPI/Swagger tại `/api-docs`.

## Triển khai nhanh với Docker Compose

### Yêu cầu
- Docker & Docker Compose

### Các bước thực hiện
1. **Clone repository này về máy:**
	```bash
	git clone https://github.com/nguyenphong1996/qr_code.git
	cd qr_code
	```
2. **Chạy ứng dụng bằng Docker Compose (tự động pull image mới nhất):**
	```bash
	docker-compose up -d
	```
	> Docker sẽ tự động pull images từ GitHub Container Registry: `ghcr.io/nguyenphong1996/qr_code-backend:latest` và `ghcr.io/nguyenphong1996/qr_code-frontend:latest`

3. **Truy cập ứng dụng:**
	- Giao diện web: http://localhost:8080
	- Tài liệu API (Swagger UI): http://localhost:8080/api-docs

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

## API
- `GET /scan`: Quét mạng, trả về danh sách thiết bị online và QR code URL.
- Xem chi tiết cấu trúc response tại http://localhost:8080/api-docs

## Cấu trúc thư mục (tham khảo)
- `backend/`: Node.js Express server, tài liệu API, Dockerfile
- `frontend/`: React app, Dockerfile, cấu hình nginx

## Ghi chú
- Không cần build thủ công, chỉ cần Docker Compose là đủ.
- Nếu muốn cập nhật phiên bản mới nhất, chỉ cần pull lại repo và chạy lại lệnh `docker-compose up -d`.

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