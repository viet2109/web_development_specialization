import { APIMessage, ChatRoom, ChatRoomFilterParams, Contact, Message, MessageFilterParams, MessageResponse, Page } from "../types";
import { api } from "./api";


export const mapRoomToContact = async (
  room: ChatRoom,
  currentUserId: number
): Promise<Contact> => {
  let lastMessage = "Chưa có tin nhắn";
  let messageTime = room.members[0]?.joinedAt;

  try {
    const response = await api.get("/messages", {
      params: {
        roomId: room.id,
        paged: true,
        page: 0,
        size: 1,
        sort: ["createdAt", "desc"],
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const messages = response.data.content;
    if (messages.length > 0) {
      const latest = messages[0];
      lastMessage =
        latest.sender.id === currentUserId
          ? `Bạn: ${latest.content}`
          : latest.content;
      messageTime = latest.createdAt;
    }
  } catch (error) {
    console.warn("Không thể lấy tin nhắn:", error);
  }

  const isGroup = room.members.length > 2;
  let displayName = room.name || `Nhóm chat ${room.id}`;
  let avatar = "/api/placeholder/40/40";

  if (!isGroup) {
    const other = room.members.find((m) => m.user.id !== currentUserId);
    const user = other?.user;
    displayName =
      other?.nickname ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      user?.email ||
      `Người dùng ${user?.id}`;
    avatar = user?.avatar || "/api/placeholder/40/40";
  }

  return {
    id: room.id,
    name: displayName,
    avatar,
    lastMessage,
    time: formatTime(messageTime),
    isOnline: room.members.some(
      (m) => m.user.id !== currentUserId && m.user.activeStatus === "ONLINE"
    ),
  };
};





export const formatTime = (dateString?: string) => {
  if (!dateString) return 'Vừa xong';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
  if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export const fetchChatRooms = async (
  filter: ChatRoomFilterParams
): Promise<Page<ChatRoom>> => {
  try {
    const response = await api.get("/chat-rooms", {
      params: {
        ...filter,
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const data: Page<ChatRoom> = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const fetchMessages = async (
  roomId: number,
  filter: MessageFilterParams
): Promise<Page<MessageResponse>> => {
  try {
    const response = await api.get(`/messages`, {
      params: {
        roomId,
        ...filter,
      },
      paramsSerializer: {
        indexes: null, 
      },
    });

    const data: Page<MessageResponse> = response.data;
    return data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const sendMessage = async (
  createMessage: {
    roomId: number;
    content: string;
    repliedTargetId?: number;
    repliedTargetType?: string;
    files?: File[];
  }
): Promise<Message> => {
  try {
    const formData = new FormData();
    const {
      roomId,
      content,
      repliedTargetId,
      repliedTargetType,
      files,
    } = createMessage;

    formData.append('roomId', roomId.toString());
    formData.append('content', content);

    if (repliedTargetId !== undefined) {
      formData.append('repliedTargetId', repliedTargetId.toString());
    }

    if (repliedTargetType) {
      formData.append('repliedTargetType', repliedTargetType);
    }

    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('multipartFiles', file);
      });
    }

    const response = await api.post('/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data as Message;
  } catch (error: any) {
    return Promise.reject(error);
  }
};
