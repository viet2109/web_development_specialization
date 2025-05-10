import { combineReducers, configureStore } from "@reduxjs/toolkit";

import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import appReducer from "./appSlice";
import authReducer from "./authSlice";
import shareReducer from "./shareSlice";
import  postReducer  from "./postSlice";
import commentsReducer from "./commentSlice";
const authConfig = {
  key: "auth",
  storage,
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: persistReducer(authConfig, authReducer),
  share : shareReducer,
  comment : commentsReducer,
  posts : postReducer,
  
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
