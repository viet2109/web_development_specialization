import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/api";

export interface PostPayload {
  content: string;
  files?: File[];
  sharedPostId?: number;
}

export const uploadImage = createAsyncThunk<string, File>(
  "post/uploadImage",
  async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url;
  }
);

export const sharePost = createAsyncThunk<void, PostPayload>(
  "post/sharePost",
  async (payload) => {
    const formData = new FormData();
    formData.append("content", payload.content);

    if (payload.sharedPostId != null) {
      formData.append("sharedPostId", payload.sharedPostId.toString());
    }

    if (payload.files && payload.files.length) {
      payload.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
);

const share = createSlice({
  name: "share",
  initialState: {
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sharePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sharePost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to share post";
      })
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to upload image";
      });
  },
});

export default share.reducer;
