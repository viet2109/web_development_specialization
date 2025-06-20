import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

interface ChatRoomPayload {
  page: number;
  size: number;
  type?: string;
  sort?: string;
  memberId?:number;
}

interface ChatRoomState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatRoomState = {
  isLoading: false,
  error: null,
};

export const fetchChatRooms = createAsyncThunk(
  "chatRoom/fetchChatRooms",
  async ({ page, size, type, sort, memberId }: ChatRoomPayload, { rejectWithValue }) => {
    try {
      const response = await api.get("/chat-rooms", {
        params: {
          type: type || "PRIVATE",
          page,
          size,
          sort: sort || "createdAt,desc",
          memberId
        },
      });
      return response.data.content; 
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat rooms"
      );
    }
  }
);

const chatRoomSlice = createSlice({
  name: "chatRoom",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default chatRoomSlice.reducer;