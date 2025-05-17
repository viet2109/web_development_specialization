import axios from "axios";
import { store } from "../redux/store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || "http://localhost:8081",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {

    

      config.headers.Authorization = `Bearer ${token}`;


    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



