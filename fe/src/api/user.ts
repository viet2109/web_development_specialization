import { FileDto, UpdateUserRequest, User, UserLoginResponse, UserProfileResponse } from "../types";
import { api } from "./api";



export const updateUserAvatar = async (
  avatarFileId: number
): Promise<User> => {
  try {
    const response =  await api.put(`/profile/avatar`, { avatarFileId })
     return response.data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const getMyProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await api.get(`/profile`);
    const data = response.data;
    console.log("👉 getMyProfile data:", data);
    return {
      id: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      avatar: data.avatarUrl ?? null,
      phone: data.phoneNumber,
      birthDate: data.birthDate,
      postCount: data.postCount,
      friendsCount: data.friendsCount,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      gender: data.gender,
      isMe: data.me,
      isfriend: data.isFriend,
      isfriendSended: data.isFriendSended 
    };
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const getUserProfileById = async (
  userId: number
): Promise<UserProfileResponse> => {
  try {
    const response = await api.get(`/profile/${userId}`);
    const data = response.data;
console.log("👉 getUserProfileById data:", data);
    return {
      id: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      avatar: data.avatarUrl ?? null,
      phone: data.phoneNumber,
      birthDate: data.birthDate,
      postCount: data.postCount,
      friendsCount: data.friendsCount,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      gender: data.gender,
      isMe: data.me,
      isfriend: data.isFriend,
      isfriendSended: data.isFriendSended

      
    };
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const updateUser = async (
  payload: UpdateUserRequest
): Promise<User> => {
  try {
    const response = await api.put(`/profile/update`, payload);
    const updatedUser: User = response.data;
    return updatedUser;
  } catch (error: any) {
    return Promise.reject(error);
  }
};
export const uploadFile = async (
  file: File
): Promise<FileDto> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    return Promise.reject(error);
  }
}

export const searchUsersByName = async (
  keyword: string
): Promise<UserLoginResponse[]> => {
  try {
    const response = await api.get("/profile/search", {
      params: { q: keyword },
    });

    return response.data;
  } catch (error: any) {
    return Promise.reject(error);
  }
};