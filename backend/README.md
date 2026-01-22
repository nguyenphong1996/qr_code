# Backend - QR Code Management System

Backend của hệ thống quản lý phòng & quét QR, xây dựng bằng Node.js, Express và SQLite.

## Tính năng

### Device Management API
- ✅ CRUD operations cho danh sách phòng
- ✅ Validation unique name (UNIQUE constraint + 409 response)
- ✅ Auto-update thông tin thiết bị qua network scan

### Scanning Modes
- **Local scan** (`/scan/local`): Cache-first, không update DB
- **Network scan** (`/scan/network`): Network resolver + update DB

### Device Type Detection
- Port `8888` → Windows 11
- Port `8081` → Android
- Other → Unknown

---

## Cài đặt & Chạy

### Yêu cầu
- Node.js >= 16
- npm >= 8

### Cài đặt dependencies
```bash
npm install
```

### Chạy development
```bash
npm start
```
Server khởi động tại: `http://localhost:3001`

### Chạy production
```bash
NODE_ENV=production npm start
```

---

## API Documentation

### Swagger UI
- URL: `http://localhost:3001/api-docs`
- OpenAPI spec: [openapi.yaml](./openapi.yaml)

### Endpoints

#### Device Management
```
GET    /api/devices       # Lấy danh sách phòng
POST   /api/devices       # Tạo phòng mới (validate unique)
PUT    /api/devices/:id   # Sửa tên phòng (validate unique)
DELETE /api/devices/:id   # Xóa phòng
```

**Validation:**
- POST/PUT trả về `409 Conflict` nếu tên phòng đã tồn tại
- Error message: `Phòng "xxx" đã tồn tại. Vui lòng chọn tên khác.`

#### Scanning
```
GET /scan/local    # Quét cache-first (nhanh, không update DB)
GET /scan/network  # Quét network + update DB (IP, port, device_type)
```

**Network scan behavior:**
- Gọi resolver: `http://qr.studiobox.vn:9096/qr/ITT/{deviceName}`
- Parse redirect URL → extract `ip`, `port`, `path`, `device_type`
- **Ghi đè** thông tin cũ trong DB

---

## Database Schema

SQLite database: `./devices.db`

```sql
CREATE TABLE devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,              -- Tên phòng (unique constraint)
  ip TEXT,                       -- IP thiết bị
  port INTEGER,                  -- Port (8888/8081/other)
  path TEXT,                     -- URL path
  last_url TEXT,                 -- Cached full URL
  device_type TEXT               -- 'windows11', 'android', 'unknown'
);
```

### Migrations
- Auto-add columns nếu chưa tồn tại (backward compatible)
- Safe schema evolution

---

## Biến môi trường

Tạo file `.env` (optional):
```bash
PORT=3001
```

---

## Docker

### Build image
```bash
docker build -t qr-code-backend .
```

### Chạy container
```bash
docker run -p 3001:3001 qr-code-backend
```

---

## Cấu trúc code

```
backend/
├── server.js          # Express app, routes, scan logic
├── database.js        # SQLite setup + migrations
├── openapi.yaml       # OpenAPI 3.0 spec
├── Dockerfile
├── package.json
└── README.md
```

### Key Functions

**`updateDeviceNetworkInfo(deviceName, info)`**
- Cập nhật `ip`, `port`, `path`, `last_url`, `device_type` vào DB
- Gọi từ `resolveViaNetwork()`

**`resolveViaNetwork(deviceName)`**
- Fetch redirect từ resolver
- Parse URL components
- Infer device type từ port
- Update DB

**`resolveFromCache(device)`**
- Build cached URL từ `ip`, `port`, `path`
- Test connectivity (timeout 2s)
- Return URL hoặc null

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad request
- `409` - Conflict (duplicate name)
- `500` - Internal server error

### Duplicate Detection
- Database: UNIQUE constraint trên `name`
- API: Manual check trước INSERT/UPDATE
- Response: `{ "error": "Phòng \"xxx\" đã tồn tại..." }`

---

## Logging

Console logs:
- `Resolved (ID: xxx) -> URL` - Network scan success
- `Using cached URL for (ID: xxx)` - Cache hit
- `Cached URL offline for (ID: xxx)` - Cache miss
- `Could not get redirect for (ID: xxx)` - Resolver fail

---

## Testing với curl

### Tạo phòng
```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{"name":"101"}'
```

### Tạo duplicate (sẽ fail)
```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{"name":"101"}'
# => 409 Conflict
```

### Quét network
```bash
curl http://localhost:3001/scan/network
```

### Xem Swagger
```bash
open http://localhost:3001/api-docs
```

---

## Notes

- SQLite database tự động tạo khi chạy lần đầu
- Network scan **ghi đè** data cũ - không lưu history
- Local scan **không thay đổi** DB, chỉ đọc cache
- Device type inference dựa vào port (hardcoded mapping)
