import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  register: (data) => axiosInstance.post("/auth/register", data),
  login: (data) => axiosInstance.post("/auth/login", data),
};

// Tasks API
export const tasksApi = {
  getAll: (params) => axiosInstance.get("/tasks", { params }),
  getById: (id) => axiosInstance.get(`/tasks/${id}`),
  create: (data) => axiosInstance.post("/tasks", data),
  update: (id, data) => axiosInstance.put(`/tasks/${id}`, data),
  complete: (id) => axiosInstance.patch(`/tasks/${id}/complete`),
  delete: (id) => axiosInstance.delete(`/tasks/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => axiosInstance.get("/dashboard"),
};

export default axiosInstance;
