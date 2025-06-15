import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_BASE_API || "https://java-app-6euq.onrender.com",
  withCredentials: true,
});
