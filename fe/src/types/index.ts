import { FC } from "react";

export interface User {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  activeStatus: "OFFLINE" | "ONLINE";
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  birthDate: string;
  bio: string;
  avatar?: FileDto;
}

export interface Post {
  id: number;
  creator: User;
  content: string;
  attachments: Attachment[];
  reactionSummary: ReactionSummary[];
  sharedPost?: Post;
  createdAt: string;
  updatedAt: string;
  totalComments: number;
  hasReacted?: boolean;
  userReactionEmoji?: string;
  userReactionId?: number;
}

export interface Attachment {
  id: number;
  file: FileDto;
}

export interface CommentResponse {
  id: number;
  content: string;
  parentId?: number;
  totalChildren: number;
  reactionSummary: ReactionSummary[];
  createdAt: string;
  updatedAt: string;
  creator: User;
  replies?: CommentResponse[];
  attachment?: AttachmentWithReactions;
  hasReacted?: boolean;
  userReactionEmoji?: string;
  userReactionId?: number;
}

export interface CommentFilterParams extends Pageable {
  parentId?: number;
}

export interface CreateComment {
  content: string;
  parentId?: number;
  attachmentFile?: File;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface FriendshipFilter extends Pageable {
  name?: string;
}

export interface FriendShipRequestResponse {
  id: number;
  sender: User;
  receiver: User;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentWithReactions {
  id: number;
  file: FileDto;
  reactionSummary: ReactionSummary[];
}

export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ReactionSummary {
  emoji: string;
  count: number;
}

export interface FileDto {
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserLoginResponse {
  user: User;
  token: string;
}

export interface Route {
  path: string;
  page: FC<any>;
  layout?: FC<any>;
}

export interface Friendship {
  id: number;
  user1: User;
  user2: User;
  createdAt: string;
}

export interface ReactionResponse {
  id: number;
  creator: User;
  emoji: string;
  createdAt: string;
  updatedAt: string;
}
