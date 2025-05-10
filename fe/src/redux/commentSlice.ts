import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

interface CommentPayload {
  content: string;
  postId: number;
  attachmentFile?: File; // Optional file for attachment
}

interface CommentsState {
  isPosting: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  isPosting: false,
  error: null,
};

export const postComment = createAsyncThunk(
  "comments/postComment",
  async ({ content, postId, attachmentFile }: CommentPayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (attachmentFile) {
        formData.append("attachmentFile", attachmentFile);
      }

      const response = await api.post(`/posts/${postId}/comments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to post comment");
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postComment.pending, (state) => {
        state.isPosting = true;
        state.error = null;
      })
      .addCase(postComment.fulfilled, (state) => {
        state.isPosting = false;
        state.error = null;
      })
      .addCase(postComment.rejected, (state, action) => {
        state.isPosting = false;
        state.error = action.payload as string;
      });
  },
});

export default commentsSlice.reducer;