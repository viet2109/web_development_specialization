import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User, UserLoginResponse } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<UserLoginResponse>) => {
      state.user = {
        ...action.payload.user,
      };
      state.token = action.payload.token;
    },
    logOutSuccess: (state) => {
      state.user = null;
      state.token = null;
    },
    updateUserSuccess: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    refreshTokenSuccess: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const {
  loginSuccess,
  logOutSuccess,
  updateUserSuccess,
  refreshTokenSuccess,
} = authSlice.actions;

export default authSlice.reducer;
