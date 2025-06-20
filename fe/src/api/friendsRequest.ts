import { FriendShipRequestResponse, Page, Pageable } from "../types";
import { api } from "./api";

export const getFriendRequestSent = async (
  pageable: Pageable
): Promise<Page<FriendShipRequestResponse>> => {
  try {
    const response = await api.get(`/friend-requests/sent`, {
      params: {
        ...pageable,
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const data: Page<FriendShipRequestResponse> = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const getFriendRequestReceived = async (
  pageable: Pageable
): Promise<Page<FriendShipRequestResponse>> => {
  try {
    const response = await api.get(`/friend-requests/received`, {
      params: {
        ...pageable,
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const data: Page<FriendShipRequestResponse> = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const acceptRequest = async (id: number): Promise<void> => {
  try {
    await api.post(`/friend-requests/${id}/accept`);
    return;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const deleteRequest = async (id: number): Promise<void> => {
  try {
    await api.delete(`/friend-requests/${id}`);
    return;
  } catch (error: any) {
    return Promise.reject(error);
  }
};


export const sendFriendRequest = async (receiverId: number) => {
  const response = await api.post("/friend-requests", receiverId, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
};

