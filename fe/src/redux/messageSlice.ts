import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

interface Sender {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  activeStatus: string;
  gender: string;
  phone: string;
  birthDate: string;
  bio: string;
  avatar: string;
}

interface Message {
  id: number;
  sender: Sender;
  content: string;
}

interface MessagePayload {
  page: number;
  size: number;
  sort?: string;
  paged?: boolean;
  senderId?: number;
}

interface SendMessagePayload {
  senderId: number;
  roomId: number;
  content: string;
}

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch messages
export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async ({ page, size, sort, paged, senderId }: MessagePayload, { rejectWithValue }) => {
    try {
      const response = await api.get("/messages", {
        params: {
          paged: paged ?? true,
          page,
          size,
          sort: sort || "createdAt,asc",
          senderId,
        },
      });
      console.log("Fetched messages:", response.data);
      return response.data.content;
    } catch (error: any) {
      console.error("Fetch error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

// Async thunk to send a message
export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async ({ senderId, roomId, content }: SendMessagePayload, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/messages",
        new URLSearchParams({
          roomId: roomId.toString(),
          content,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log("Message sent:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Send error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.messages = [...state.messages, action.payload];
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages } = messageSlice.actions;
export default messageSlice.reducer;