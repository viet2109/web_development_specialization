import { ReactionResponse } from "../types";
import { api } from "./api";

export const deleteReaction = async (reactionId: number): Promise<void> => {
  try {
    await api.delete(`/reactions/${reactionId}`);
    return;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const updateReaction = async (
  emoji: string,
  reactionId: number
): Promise<ReactionResponse> => {
  try {
    const response = await api.put(`/reactions/${reactionId}`, emoji, {
      headers: { "Content-Type": "text/plain" },
    });
    const data: ReactionResponse = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};
