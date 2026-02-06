# Frontend - QR Code Manager

React application cho quản lý phòng và quét QR code.

## 📦 Chuẩn bị

### Yêu cầu
- **Node.js** v14+
- **NPM** v6+

## 🚀 Khởi chạy

### Development Mode

```bash
# Cài dependencies
npm install

# Khởi động server phát triển
npm start

# Ứng dụng mở tự động tại http://localhost:3000
```

### Production Build

```bash
# Build tối ưu cho production
npm run build

# Output: ./build/
# Có thể deploy folder này lên web server (Nginx, Apache, v.v.)
```

## 🔧 Cấu hình API

Ứng dụng **tự động phát hiện API URL** dựa trên hostname hiện tại:

| Cách truy cập | API URL |
|---|---|
| `http://localhost:3000` | `http://localhost:3001` |
| `http://192.168.1.100:3000` | `http://192.168.1.100:3001` |
| `http://server.local:3000` | `http://server.local:3001` |

### Cấu hình thủ công (Tùy chọn)

Nếu muốn chỉ định API URL cụ thể:

```bash
# Tạo file .env
cp .env.example .env

# Chỉnh sửa .env
nano .env
# REACT_APP_API_URL=http://192.168.1.100:3001

# Khởi động lại
npm start
```

## 📱 Truy cập từ thiết bị khác

### Tìm IP server

```bash
# Linux/Mac
ip addr show | grep "inet "

# Windows
ipconfig
```

### Mở trên điện thoại/tablet

Mở browser nhập:
```
http://192.168.1.100:3000
```

(Thay IP theo server của bạn)

## 📚 Dependencies chính

- **React 19** - Frontend framework
- **Material-UI 7** - UI components
- **React Router 7** - Navigation
- **Axios** - HTTP client
- **QRCode.react** - Generate QR codes
- **Lucide React** - Icons

## 📁 Cấu trúc thư mục

```
src/
├── App.js                    # Main component
├── App.css                   # Styles
├── DeviceManagerPage.js      # Quản lý phòng
├── config.js                 # API configuration
├── constants/
│   └── branches.js           # Chi nhánh data
├── index.js                  # Entry point
├── index.css                 # Global styles
└── public/
    ├── index.html
    └── manifest.json
```

## 🎨 Tính năng giao diện

- ✅ **Responsive Design** - Mobile, tablet, desktop
- ✅ **Dark Theme** - Dễ nhìn, professional
- ✅ **Icons** - Lucide React icons
- ✅ **Form Validation** - Kiểm tra input
- ✅ **Error Handling** - Thông báo lỗi chi tiết
- ✅ **Loading State** - Spinner khi đang quét

## 🔌 API Integration

### Scan mạng
```javascript
GET http://localhost:3001/scan/network?branch=IPHI
```

### Quản lý phòng
```javascript
GET    /api/devices?branch=IPHI        // Lấy danh sách
POST   /api/devices                    // Thêm phòng
PUT    /api/devices/:id                // Sửa phòng
DELETE /api/devices/:id                // Xóa phòng
```

## 🐛 Debugging

### Kiểm tra API URL

Mở DevTools (F12) → Console → Tìm log:
```
API Base URL: http://localhost:3001
```

### Kiểm tra Network requests

DevTools → Network tab → Xem các request đến API

### Kiểm tra Local Storage

DevTools → Application → Local Storage → Xem dữ liệu lưu trữ

## 📄 License

ISC

### `npm start`

Chạy ứng dụng ở chế độ phát triển.\
Mở [http://localhost:3000](http://localhost:3000) để xem trong trình duyệt của bạn.

Trang sẽ tự động tải lại khi bạn thực hiện thay đổi.\
Bạn cũng có thể thấy các lỗi lint trong bảng điều khiển.

### `npm test`

Khởi chạy trình chạy thử nghiệm ở chế độ xem tương tác.\
Xem phần về [chạy thử nghiệm](https://facebook.github.io/create-react-app/docs/running-tests) để biết thêm thông tin.

### `npm run build`

Build ứng dụng cho môi trường sản xuất vào thư mục `build`.\
Nó sẽ gộp React ở chế độ sản xuất và tối ưu hóa build để đạt hiệu suất tốt nhất.

Build sẽ được thu nhỏ và các tên tệp sẽ bao gồm các hash.\
Ứng dụng của bạn đã sẵn sàng để triển khai!

Xem phần về [triển khai](https://facebook.github.io/create-react-app/docs/deployment) để biết thêm thông tin.

### `npm run eject`

**Lưu ý: đây là một thao tác một chiều. Khi bạn `eject`, bạn không thể quay lại!**

Nếu bạn không hài lòng với công cụ build và các lựa chọn cấu hình, bạn có thể `eject` bất kỳ lúc nào. Lệnh này sẽ loại bỏ sự phụ thuộc duy nhất từ dự án của bạn.

Thay vào đó, nó sẽ sao chép tất cả các tệp cấu hình và các phụ thuộc chuyển tiếp (webpack, Babel, ESLint, v.v.) trực tiếp vào dự án của bạn để bạn có toàn quyền kiểm soát chúng. Tất cả các lệnh ngoại trừ `eject` vẫn sẽ hoạt động, nhưng chúng sẽ trỏ đến các script đã được sao chép để bạn có thể tùy chỉnh chúng. Tại thời điểm này, bạn sẽ tự chịu trách nhiệm.

Bạn không cần phải sử dụng `eject`. Bộ tính năng được quản lý phù hợp cho các triển khai nhỏ và trung bình, và bạn không nên cảm thấy bắt buộc phải sử dụng tính năng này. Tuy nhiên, chúng tôi hiểu rằng công cụ này sẽ không hữu ích nếu bạn không thể tùy chỉnh nó khi bạn đã sẵn sàng.

## Tìm hiểu thêm

Bạn có thể tìm hiểu thêm trong [tài liệu Create React App](https://facebook.github.io/create-react-app/docs/getting-started).

Để học React, hãy xem [tài liệu React](https://reactjs.org/).

### Tách mã nguồn

Phần này đã được chuyển đến đây: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Phân tích kích thước gói

Phần này đã được chuyển đến đây: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Tạo Progressive Web App

Phần này đã được chuyển đến đây: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Cấu hình nâng cao

Phần này đã được chuyển đến đây: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Triển khai

Phần này đã được chuyển đến đây: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` không thể thu nhỏ

Phần này đã được chuyển đến đây: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
