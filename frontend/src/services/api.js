import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const STORAGE_KEYS = { TOKEN: "token", USER: "user" };

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
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
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data) => axiosInstance.post("/auth/register", data),
  login: (data) => axiosInstance.post("/auth/login", data),
};

export const tasksApi = {
  getAll: (params) => axiosInstance.get("/tasks", { params }),
  getById: (id) => axiosInstance.get(`/tasks/${id}`),
  create: (data) => axiosInstance.post("/tasks", data),
  update: (id, data) => axiosInstance.put(`/tasks/${id}`, data),
  complete: (id) => axiosInstance.patch(`/tasks/${id}/complete`),
  delete: (id) => axiosInstance.delete(`/tasks/${id}`),
};

export const dashboardApi = {
  getStats: () => axiosInstance.get("/dashboard"),
};

export default axiosInstance;
