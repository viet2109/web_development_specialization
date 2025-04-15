// store/postSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface LikePayload {
  postId: number;
  userId: number;
}

export const likePost = createAsyncThunk("posts/likePost", async ({ postId, userId }: LikePayload) => {
  await axios.post(`http://localhost:8081/posts/${postId}/like`, { userId });
  return { postId, userId };
});

export const unlikePost = createAsyncThunk("posts/unlikePost", async (postId: number) => {
  await axios.post(`http://localhost:8081/posts/${postId}/unlike`);
  return postId;
});

export const deletePost = createAsyncThunk("posts/deletePost", async (postId: number) => {
  await axios.delete(`http://localhost:8081/posts/${postId}`);
  return postId;
});

interface PostState {
  likes: { [postId: number]: number[] };
  isLoading: boolean;
}

const initialState: PostState = {
  likes: {},
  isLoading: false,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        if (!state.likes[postId]) state.likes[postId] = [];
        state.likes[postId].push(userId);
        state.isLoading = false;
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.likes[postId] = state.likes[postId]?.filter((id) => id !== postId);
        state.isLoading = false;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        delete state.likes[postId];
        state.isLoading = false;
      })
      .addMatcher((action) => action.type.startsWith("posts/") && action.type.endsWith("/pending"), (state) => {
        state.isLoading = true;
      });
  },
});

export default postSlice.reducer;
