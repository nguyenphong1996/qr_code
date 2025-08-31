# Backend - QR Scanner App

Đây là phần backend của ứng dụng QR Scanner, được xây dựng bằng Node.js và Express.

## Hướng dẫn cài đặt

### Yêu cầu
- Node.js >= 16
- npm >= 8

### Cài đặt dependencies
Chạy lệnh sau để cài đặt các dependencies cần thiết:
```bash
npm install
```

## Cách chạy ứng dụng

### Chạy ứng dụng trong môi trường phát triển
Sử dụng lệnh sau để khởi chạy server:
```bash
npm start
```
Server sẽ chạy tại: `http://localhost:3001`

### Chạy ứng dụng trong môi trường sản xuất
Sử dụng lệnh sau để chạy ứng dụng trong môi trường sản xuất:
```bash
NODE_ENV=production npm start
```

## API

### Tài liệu API
- Tài liệu API được cung cấp tại: `http://localhost:3001/api-docs`
- File OpenAPI: [openapi.yaml](./openapi.yaml)

### Các endpoint chính
- `GET /scan`: Quét mạng nội bộ và trả về danh sách các thiết bị online cùng với mã QR tương ứng.

## Biến môi trường

Cấu hình các biến môi trường trong file `.env` (nếu cần):
- `PORT`: Cổng mà server sẽ lắng nghe (mặc định: 3001)
- `NETWORK_RANGE`: Dải mạng để quét (ví dụ: `192.168.1.0/24`)

## Docker

### Build image Docker
Sử dụng lệnh sau để build image Docker:
```bash
docker build -t qr-scanner-backend .
```

### Chạy container Docker
Sử dụng lệnh sau để chạy container:
```bash
docker run -p 3001:3001 qr-scanner-backend
```

## Ghi chú
- Đảm bảo rằng bạn đã cấu hình đúng dải mạng trong biến môi trường `NETWORK_RANGE` để quét các thiết bị trong mạng nội bộ.
- Kiểm tra tài liệu API để biết thêm chi tiết về các endpoint.