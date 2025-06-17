import { Friendship, FriendshipFilter, Page } from "../types";
import { api } from "./api";

export const fetchFriendships = async (
  filter: FriendshipFilter
): Promise<Page<Friendship>> => {
  try {
    const response = await api.get(`/friendships`, {
      params: {
        ...filter,
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const data: Page<Friendship> = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const deleteFriendship = async (id: number): Promise<void> => {
  try {
    await api.delete(`/friendships/${id}`);
    return;
  } catch (error: any) {
    return Promise.reject(error);
  }
};
