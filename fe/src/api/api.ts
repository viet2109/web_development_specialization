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
const API_BASE_URL = "http://localhost:8081"; // URL của backend

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        return response.data; 
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}
export const register = async (
  
  email: string,
  password: string,
  fistName: string,
  lastName: string,
  gender: "MALE" | "FEMALE" | "OTHER"
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
     
      email,
      password,
      fistName,
      lastName,
      gender,
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
