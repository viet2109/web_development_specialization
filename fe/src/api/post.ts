import { ReactionResponse } from "../types";
import { api } from "./api";

export const reactPost = async (
  emoji: string,
  postId: number
): Promise<ReactionResponse> => {
  try {
    const response = await api.post(`/posts/${postId}/reactions`, emoji, {
      headers: { "Content-Type": "text/plain" },
    });
    const data: ReactionResponse = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};
