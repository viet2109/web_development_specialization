import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

interface LikePayload {
  postId: number;
  userId: number;
}

interface PostState {
  likes: { [postId: number]: number[] };
  isLoading: boolean;
  error: string | null;
}

const initialState: PostState = {
  likes: {},
  isLoading: false,
  error: null,
};


export const likePost = createAsyncThunk(
  "posts/likePost",
  async ({ postId, userId }: LikePayload, { rejectWithValue }) => {
    try {
      await api.post(`/posts/${postId}/like`, { userId });
      return { postId, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to like post");
    }
  }
);

export const unlikePost = createAsyncThunk(
  "posts/unlikePost",
  async (postId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}/unlike`);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to unlike post");
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete post");
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Like Post
      .addCase(likePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        if (!state.likes[postId]) state.likes[postId] = [];
        state.likes[postId].push(userId);
        state.isLoading = false;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Unlike Post
      .addCase(unlikePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const postId = action.payload;
        const currentUserId = state.likes[postId]?.[0]; 
        state.likes[postId] = state.likes[postId]?.filter((id) => id !== currentUserId) || [];
        state.isLoading = false;
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        delete state.likes[postId];
        state.isLoading = false;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetError } = postSlice.actions;
export default postSlice.reducer;