import {
  CommentFilterParams,
  CommentResponse,
  CreateComment,
  Page,
  ReactionResponse,
} from "../types";
import { api } from "./api";

export const fetchComments = async (
  filter: CommentFilterParams,
  postId: number
): Promise<Page<CommentResponse>> => {
  try {
    const response = await api.get(`/posts/${postId}/comments`, {
      params: {
        ...filter,
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const data: Page<CommentResponse> = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const createComment = async (
  createComment: CreateComment,
  postId: number
): Promise<CommentResponse> => {
  try {
    const formData = new FormData();
    const { content, parentId, attachmentFile } = createComment;
    formData.append("content", content);
    if (attachmentFile) {
      formData.append("attachmentFile", attachmentFile);
    }
    if (parentId) {
      formData.append("parentId", parentId.toString());
    }

    const response = await api.post(`/posts/${postId}/comments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data: CommentResponse = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const reactComment = async (
  emoji: string,
  commentId: number
): Promise<ReactionResponse> => {
  try {
    const response = await api.post(`/comments/${commentId}/reactions`, emoji, {
      headers: { "Content-Type": "text/plain" },
    });
    const data: ReactionResponse = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};
