const getApiBaseUrl = () => {
    // Nếu có biến môi trường REACT_APP_API_URL, sử dụng nó
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // Lấy hostname từ URL hiện tại
    const hostname = window.location.hostname;
    const protocol = window.location.protocol; // http: hoặc https:
    
    // Sử dụng cùng hostname, cùng protocol (http/https), port 3001 cho API
    return `${protocol}//${hostname}:3001`;
};

export const API_BASE_URL = getApiBaseUrl();

if (process.env.NODE_ENV === 'development') {
    console.log('API Base URL:', API_BASE_URL);
}
