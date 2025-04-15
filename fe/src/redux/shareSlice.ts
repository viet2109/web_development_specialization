// redux/postSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface PostPayload {
  desc: string;
  img?: string;
}

export const uploadImage = createAsyncThunk<string, File>(
  "post/uploadImage",
  async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:8081/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url; // Trả về URL từ server
  }
);

export const sharePost = createAsyncThunk<void, PostPayload>(
  "post/sharePost",
  async (payload) => {
    await axios.post("http://localhost:8081/posts", payload);
  }
);

const share = createSlice({
  name: "share",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {},
});

export default share.reducer;
