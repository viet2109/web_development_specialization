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
  avatar?: FileDto; // File object trong browser
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
}

export interface Attachment {
  url: any;
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

interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
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

export interface ReactionResponse {
  id: number;
  creator: User;
  emoji: string;
  createdAt: string;
  updatedAt: string;
}


export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  
}

export interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
}

export interface Member {
  id: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string | null;
    activeStatus: 'ONLINE' | 'OFFLINE';
    avatar: string | null;
  };
  roles: string[];
  joinedAt: string;
  nickname: string | null;
}

export interface ChatRoom {
  id: number;
  name: string;
  creator: {
    id: number;
    email: string;
    firstName: string;
    lastName: string | null;
  };
  members: Member[];
}

export interface Message {
  fromMe: boolean;
  type: 'text' | 'image';
  content: string;
  createdAt: string;
}

export interface APIMessage {
  id: number;
  sender: {
    id: number;
    firstName: string;
    lastName: string | null;
  };
  content: string;
  createdAt: string;
  attachments: { url: string }[];
}


export interface MessageResponse {
  id: number;
  content: string;
  sender: User;
  createdAt: string;
  attachments: Attachment[];
}
export interface MessageFilterParams {
 page: number;
  size: number;
  sort: string[];
}
export interface ChatRoomFilterParams {
  page: number;
  size: number;
  sort?: string | string[];
  memberId: number;
}
export interface SendMessagePayload {
 roomId: number;
  content: string;
  repliedTargetId?: number;
  repliedTargetType?: string;
  files?: File[];

}