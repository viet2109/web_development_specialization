import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

interface HeartPayload {
  postId: number;
  userId: number;
}

interface PostState {
  hearts: { [postId: number]: number[] };
  isLoading: boolean;
  error: string | null;
}

const initialState: PostState = {
  hearts: {},
  isLoading: false,
  error: null,
};

export const heartPost = createAsyncThunk(
  "posts/heartPost",
  async ({ postId, userId }: HeartPayload, { rejectWithValue }) => {
    try {
      await api.post(`/posts/${postId}/reactions`, { userId });
      return { postId, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to heart post");
    }
  }
);

export const unheartPost = createAsyncThunk(
  "posts/unheartPost",
  async ({ postId, userId }: { postId: number; userId: number }, { rejectWithValue }) => {
    try {
      await api.delete(`/${postId}/reactions`, { data: { userId } });
      return { postId, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to unheart post");
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
  name: "post",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Heart Post
      .addCase(heartPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(heartPost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        if (!state.hearts[postId]) state.hearts[postId] = [];
        if (!state.hearts[postId].includes(userId)) {
          state.hearts[postId].push(userId);
        }
        state.isLoading = false;
      })
      .addCase(heartPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Unheart Post
      .addCase(unheartPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unheartPost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        state.hearts[postId] = state.hearts[postId]?.filter((id) => id !== userId) || [];
        state.isLoading = false;
      })
      .addCase(unheartPost.rejected, (state, action) => {
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
        delete state.hearts[postId];
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