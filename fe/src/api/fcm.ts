import { fetchEnd, fetchStart } from "../redux/appSlice";
import { store } from "../redux/store";
import { api } from "./api";

export async function subscribeUserTopic(token: string): Promise<void> {
  store.dispatch(fetchStart());
  try {
    await api.post("/fcm-tokens", token, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    return Promise.reject(error);
  } finally {
    store.dispatch(fetchEnd());
  }
}

export async function subscribeAllUser(token: string): Promise<void> {
  store.dispatch(fetchStart());
  try {
    await api.post("/fcm-tokens/all", token, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    return Promise.reject(error);
  } finally {
    store.dispatch(fetchEnd());
  }
}

export async function unsubscribeUserTopic(token: string): Promise<void> {
  store.dispatch(fetchStart());
  try {
    await api.delete(`/fcm-tokens/${token}`);
  } catch (error: any) {
    return Promise.reject(error);
  } finally {
    store.dispatch(fetchEnd());
  }
}
