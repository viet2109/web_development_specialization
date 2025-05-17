// friendRequestSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

interface FriendRequest {
  id: number;
  senderId: number;
  senderUsername: string;
  senderProfilePic: string;
  createdAt: string;
}

interface FriendRequestState {
  requests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

const initialState: FriendRequestState = {
  requests: [],
  isLoading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
};

export const fetchFriendRequests = createAsyncThunk(
  "friendRequests/fetchFriendRequests",
  async (
    { page = 0, size = 10 }: { page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/friend-requests/received?page=${page}&size=${size}&sort=createdAt,desc`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch friend requests"
      );
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friendRequests/accept',
  async (requestId: number, { rejectWithValue }) => {
    try {
      await api.post(`/friend-requests/${requestId}/accept`);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to accept friend request"
      );
    }
  }
);

export const declineFriendRequest = createAsyncThunk(
  'friendRequests/decline',
  async (requestId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/friend-requests/${requestId}`);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to decline friend request"
      );
    }
  }
);

const friendRequestSlice = createSlice({
  name: "friendRequest",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriendRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.pageable?.pageNumber || 0;
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          request => request.id !== action.payload
        );
      })
      .addCase(declineFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          request => request.id !== action.payload
        );
      });
  },
});

export const { resetError } = friendRequestSlice.actions;
export default friendRequestSlice.reducer;