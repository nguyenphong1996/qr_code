# Backend - QR Code Manager

Node.js + Express server quản lý phòng và quét thiết bị mạng.

## 📦 Yêu cầu

- **Node.js** v14+
- **NPM** v6+

## 🚀 Khởi chạy

### Development Mode

```bash
# Cài dependencies
npm install

# Khởi động server
npm start

# Server chạy tại http://localhost:3001
```

Server sẽ:
- Tạo database SQLite tại `devices.db` (nếu chưa tồn tại)
- Serve API tại port 3001
- Serve Swagger UI tại `/api-docs`

### Production Mode

```bash
# Cài dependencies
npm install --production

# Khởi động
npm start
```

## 📚 API Endpoints

### Chi nhánh
```
GET /api/branches
```
Danh sách 27 chi nhánh ICOOL (dữ liệu tĩnh).

**Response:**
```json
{
  "message": "success",
  "data": [
    {
      "code": "PHI",
      "prefixed": "IPHI",
      "name": "ICOOL Phan Huy Ích",
      "address": "455 Phan Huy Ích, Phường An Hội Tây, Quận Gò Vấp, TP.HCM"
    }
  ]
}
```

### Phòng / Thiết bị

#### Lấy danh sách
```
GET /api/devices?branch=IPHI
```

**Query params:**
- `branch` (optional) - Lọc theo chi nhánh

**Response:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "101",
      "branch": "IPHI",
      "ip": "192.168.1.50",
      "port": 8888,
      "path": "/",
      "last_url": "http://192.168.1.50:8888/",
      "device_type": "windows11"
    }
  ]
}
```

#### Thêm phòng
```
POST /api/devices
Content-Type: application/json

{
  "name": "101",
  "branch": "IPHI"
}
```

**Response (201):**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "name": "101",
    "branch": "IPHI"
  }
}
```

#### Sửa phòng
```
PUT /api/devices/:id
Content-Type: application/json

{
  "name": "102"
}
```

#### Xóa phòng
```
DELETE /api/devices/:id
```

**Response:**
```json
{
  "message": "deleted",
  "changes": 1
}
```

### Quét mạng

```
GET /scan/network?branch=IPHI
```

Quét toàn bộ thiết bị trong chi nhánh và cập nhật DB.

**Response:**
```json
[
  {
    "deviceId": "101",
    "url": "http://192.168.1.50:8888/",
    "type": "windows11"
  },
  {
    "deviceId": "102",
    "url": "http://192.168.1.51:8081/",
    "type": "android"
  }
]
```

### API Documentation

```
GET /api-docs
```

Swagger UI interactif để test API.

## 🗄️ Database

### Schema

```sql
CREATE TABLE devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  ip TEXT,
  port INTEGER,
  path TEXT,
  last_url TEXT,
  device_type TEXT,
  UNIQUE(name, branch)
);
```

### Indexes
```sql
CREATE UNIQUE INDEX idx_name_branch ON devices(name, branch)
```

### Database file
```
backend/devices.db
```

Nếu muốn reset database, xóa file này rồi khởi động lại server.

## ⚙️ Cấu hình

### Environment Variables

Hiện tại không sử dụng `.env`. Có thể thêm sau để cấu hình:
- Port
- Database path
- Resolver URL
- CORS origins

### Port

Mặc định: `3001`

Để thay đổi, chỉnh sửa `server.js`:
```javascript
const port = 3001;  // Thay số ở đây
```

### Resolver URL

Hiện tại sử dụng: `http://qr.studiobox.vn:9096`

Để thay đổi, chỉnh sửa `server.js`:
```javascript
const publicUrl = `http://qr.studiobox.vn:9096/qr/ITT/${deviceName}`;
```

## 🏗️ Cấu trúc file

```
backend/
├── server.js           # Main server file
├── database.js         # SQLite setup
├── openapi.yaml        # API documentation
├── package.json
├── devices.db          # SQLite database (auto-created)
└── README.md
```

## 📖 Files chính

### server.js
- Express setup
- Routes definition
- Request handling
- Error handling

### database.js
- SQLite connection
- Table creation
- Schema migration

### openapi.yaml
- API specification
- Endpoint definitions
- Request/response schemas
- Examples

## 🔌 Headers

Tất cả requests lên server cần:
```
Content-Type: application/json
```

CORS được enable cho tất cả origins.

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Branch là bắt buộc."
}
```

### 409 Conflict
```json
{
  "error": "Phòng \"101\" đã tồn tại trong chi nhánh này. Vui lòng chọn tên khác."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

## 🧪 Test API

### Với curl

```bash
# Lấy chi nhánh
curl http://localhost:3001/api/branches

# Lấy phòng
curl "http://localhost:3001/api/devices?branch=IPHI"

# Thêm phòng
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{"name":"101", "branch":"IPHI"}'

# Quét mạng
curl "http://localhost:3001/scan/network?branch=IPHI"
```

### Với Postman

1. Import OpenAPI file: `openapi.yaml`
2. Chọn endpoint muốn test
3. Nhấp "Send"

## 🐛 Troubleshooting

### Port 3001 đã bị chiếm

```bash
# Tìm process
lsof -i :3001  # Linux/Mac
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### Database bị lỗi

```bash
# Xóa database cũ
rm devices.db

# Khởi động lại server để tạo database mới
npm start
```

### Quét không tìm thấy thiết bị

- Kiểm tra danh sách phòng đã thêm chưa
- Kiểm tra network resolver có hoạt động không
- Kiểm tra firewall
- Xem logs trong terminal

## 📄 License

ISC

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
