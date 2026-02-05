# QR Code - Hệ Thống Quản Lý Phòng & Quét QR

Ứng dụng gồm Backend (Node.js/Express + SQLite) và Frontend (React + Material-UI) cho phép quản lý danh sách phòng và quét thiết bị trong mạng nội bộ, hiển thị mã QR tương ứng cho từng thiết bị trên giao diện web.

## Tính năng chính

### 🏢 Quản lý phòng
- ✅ Thêm/sửa/xóa phòng với giao diện Material-UI đẹp mắt
- ✅ Validation tên phòng unique (không cho phép trùng)
- ✅ Hiển thị theo tầng (Tầng trệt, Tầng 1-6, Khác)
- ✅ Layout 3 cột responsive, chip pill-shaped với gradient
- ✅ Icon phân biệt loại thiết bị (Windows 11, Android)

### 🔍 Quét thiết bị
- **Local scan** (`/scan/local`): Quét cache-first, nhanh, không cập nhật DB
- **Network scan** (`/scan/network`): Quét qua resolver, cập nhật thông tin thiết bị mới vào DB
- Tự động cập nhật IP, port, path, device_type khi quét network
- Hiển thị danh sách thiết bị online và mã QR tương ứng

### 📖 API Documentation
- Swagger UI tích hợp tại `/api-docs`
- OpenAPI 3.0 spec với đầy đủ endpoints, schemas, examples

## Triển khai nhanh với Docker Compose

### Yêu cầu
- Docker & Docker Compose

### Các bước thực hiện
1. **Clone repository:**
   ```bash
   git clone https://github.com/nguyenphong1996/qr_code.git
   cd qr_code
   ```

2. **Chạy ứng dụng (tự động pull images mới nhất):**
   ```bash
   docker-compose up -d
   ```
   > Docker tự động pull từ GitHub Container Registry:
   > - `ghcr.io/nguyenphong1996/qr_code-backend:latest`
   > - `ghcr.io/nguyenphong1996/qr_code-frontend:latest`

   **Lưu ý:** Các Docker image được tự động build và push lên GitHub Container Registry (GHCR) thông qua GitHub Actions mỗi khi có thay đổi trên nhánh `main`.

3. **Truy cập ứng dụng:**
   - 🌐 Giao diện web: http://localhost:8080
   - 📚 API Docs (Swagger): http://localhost:8080/api-docs
   - 🔧 Backend API: http://localhost:8080/api/*

---

## 🚀 Deploy nhanh (không cần clone code)

```bash
# Tải docker-compose.yml
curl -O https://raw.githubusercontent.com/nguyenphong1996/qr_code/main/docker-compose.yml

# Pull images từ GHCR
docker compose pull

# Chạy
docker compose up -d
```

**Truy cập:**
- Giao diện: http://localhost:8080
- API Docs: http://localhost:8080/api-docs

---

## API Endpoints

### Device Management
- `GET /api/devices` - Lấy danh sách phòng
- `POST /api/devices` - Tạo phòng mới (validate unique)
- `PUT /api/devices/:id` - Cập nhật tên phòng (validate unique)
- `DELETE /api/devices/:id` - Xóa phòng

### Scanning
- `GET /scan/local` - Quét cache-first (nhanh, không update DB)
- `GET /scan/network` - Quét network + update DB (IP, port, device_type)

### Validation Rules
- ❌ Không cho phép tạo/sửa tên phòng trùng (case-insensitive)
- ✅ Backend: UNIQUE constraint + 409 Conflict response
- ✅ Frontend: Client-side validation + error Alert

Chi tiết: http://localhost:8080/api-docs

---

## Cấu trúc thư mục
```
qr_code/
├── backend/
│   ├── server.js          # Express server, API routes
│   ├── database.js        # SQLite setup + migrations
│   ├── openapi.yaml       # OpenAPI 3.0 spec
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app + QR scanner page
│   │   ├── DeviceManagerPage.js  # Device CRUD UI
│   │   └── ...
│   ├── Dockerfile         # Multi-stage build (React app + Nginx server)
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

---

## Liên kết GHCR Images
- [Backend Image](https://github.com/nguyenphong1996/qr_code/pkgs/container/qr_code-backend)
- [Frontend Image](https://github.com/nguyenphong1996/qr_code/pkgs/container/qr_code-frontend)

---

## Ghi chú kỹ thuật

### Database Schema
```sql
CREATE TABLE devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,              -- Tên phòng (unique constraint)
  ip TEXT,                       -- IP thiết bị (cập nhật qua network scan)
  port INTEGER,                  -- Port (8888=Windows11, 8081=Android)
  path TEXT,                     -- URL path
  last_url TEXT,                 -- Cached URL đầy đủ
  device_type TEXT               -- 'windows11', 'android', 'unknown'
);
```

### Device Type Inference
- Port `8888` → Windows 11
- Port `8081` → Android
- Khác → Unknown

### Data Overwrite Behavior
- **Network scan** (`/scan/network`): Cập nhật thông tin thiết bị mới, **ghi đè** data cũ
- Không lưu lịch sử - chỉ giữ thông tin mới nhất

---

## Development

### Chạy local không dùng Docker

**Backend:**
```bash
cd backend
npm install
npm start  # http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm start  # http://localhost:3000
```

### Rebuild Docker images
```bash
docker-compose build
docker-compose up -d
```

---

## Cập nhật phiên bản mới
```bash
git pull
docker-compose pull
docker-compose up -d
```

## Tác giả
- Nguyễn Phong