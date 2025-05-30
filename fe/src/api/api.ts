import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || "http://localhost:8080",
  withCredentials: true,
});

// Hàm để thiết lập token sau khi store đã sẵn sàng
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Interceptor để xử lý lỗi (nếu cần)
api.interceptors.request.use(
  (config) => {
    return config; // Token đã được thiết lập qua setAuthToken, không cần làm gì thêm
  },
  (error) => {
    return Promise.reject(error);
  }
);


