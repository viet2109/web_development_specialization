import axios from "axios";
import { store } from "../redux/store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || "http://localhost:8080",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3ZWFyZWNoYW1waW9uMjEwOTIwMDNAZ21haWwuY29tIiwiaWF0IjoxNzQ2NTk0NDMwLCJleHAiOjE3NDY2ODA4MzB9.m3ovTP4JZi-_TIPNy30s1zHEi52LAcMehyN31L5TnyttyY7k9GmaIRXyecm-VhRresiwCPg2_n5E0jiOri3F9Q`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
