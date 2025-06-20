import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import {
  fetchFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  resetError as resetFriendError,
} from "../../redux/friendRequestSlice";
import { fetchChatRooms } from "../../redux/chatRoomSlice";
import { ClipLoader } from "react-spinners";
import { UserPlus, MessageCircle, Check, X, Users, Wifi } from "lucide-react";

interface ChatRoom {
  id: number;
  name: string;
  type: string;
  createdAt: string;
}

const RightBar: React.FC = () => {
  const [openChat, setOpenChat] = useState(false);
  const [chatUser, setChatUser] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const dispatch = useAppDispatch();

  const {
    requests,
    isLoading: isFriendLoading,
    error: friendError,
  } = useAppSelector((state) => state.friendRequest);

  const {
    isLoading: isChatLoading,
    error: chatError,
  } = useAppSelector((state) => state.chatRoom);

  useEffect(() => {
    dispatch(fetchFriendRequests({ page: 0, size: 10 }));
    dispatch(fetchChatRooms({ page: 0, size: 10, type: "PRIVATE", sort: "createdAt,desc" }))
      .unwrap()
      .then((data) => setRooms(data))
      .catch((err) => console.error("Error fetching chat rooms:", err));
  }, [dispatch]);

  const handleOpenChat = (username: string) => {
    setChatUser(username);
    setOpenChat(true);
  };

  const handleAccept = async (id: number) => {
    try {
      await dispatch(acceptFriendRequest(id)).unwrap();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await dispatch(declineFriendRequest(id)).unwrap();
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  return (
    <div className="flex-1 max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Friend Requests Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Friend Requests
              </h3>
              {requests.length > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {requests.length}
                </span>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            {isFriendLoading ? (
              <div className="flex justify-center py-8">
                <ClipLoader size={24} color="#3b82f6" />
              </div>
            ) : friendError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 dark:text-red-300">{friendError}</p>
                    <button
                      onClick={() => dispatch(resetFriendError())}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No friend requests
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {request.sender.firstName} {request.sender.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {request.sender.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 dark:bg-green-600/20 dark:hover:bg-green-600/30 text-green-600 dark:text-green-400 rounded-full transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 dark:bg-red-600/20 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400 rounded-full transition-colors"
                        title="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Rooms Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat Rooms
              </h3>
              {rooms.length > 0 && (
                <span className="ml-auto bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {rooms.length}
                </span>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            {isChatLoading ? (
              <div className="flex justify-center py-8">
                <ClipLoader size={24} color="#10b981" />
              </div>
            ) : chatError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 dark:text-red-300">{chatError}</p>
                    <button
                      onClick={() => setRooms([])}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No chat rooms available
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleOpenChat(room.name)}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full flex items-center justify-center">
                        <Wifi className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {room.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {room.type === "PRIVATE" ? "Private Chat" : "Group Chat"}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightBar;