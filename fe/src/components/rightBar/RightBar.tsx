import React, { useEffect, useState } from "react";
import "../rightBar/RightBar.css";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import {
  fetchFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  resetError as resetFriendError,
} from "../../redux/friendRequestSlice";
import { fetchChatRooms } from "../../redux/chatRoomSlice";
import { ClipLoader } from "react-spinners";

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
    <div className="rightBar">
      <div className="container">
        {/* Friend Requests Section */}
        <div className="item">
          <span>Friend Requests</span>
          {isFriendLoading ? (
            <div className="flex justify-center py-4">
              <ClipLoader size={20} color="#3b82f6" />
            </div>
          ) : friendError ? (
            <div className="error-message">
              {friendError}
              <button
                onClick={() => dispatch(resetFriendError())}
                className="dismiss-btn"
              >
                Dismiss
              </button>
            </div>
          ) : requests.length === 0 ? (
            <p className="text-gray-500 py-2">No friend requests</p>
          ) : (
            requests.map((request) => (
              <div className="user-request" key={request.id}>
                <div className="user-info">
                  <img
                    src={request.sender.avatar || "/default-avatar.png"}
                    alt={`${request.sender.firstName} ${request.sender.lastName}`}
                    className="avatar"
                  />
                  <span>{request.sender.email}</span>
                </div>
                <div className="action-buttons">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="accept-btn"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="decline-btn"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Rooms Section */}
        <div className="item online-friends">
          <span>Chat Rooms</span>
          {isChatLoading ? (
            <div className="flex justify-center py-4">
              <ClipLoader size={20} color="#3b82f6" />
            </div>
          ) : chatError ? (
            <div className="error-message">
              {chatError}
              <button
                onClick={() => setRooms([])}
                className="dismiss-btn"
              >
                Dismiss
              </button>
            </div>
          ) : rooms.length === 0 ? (
            <p className="text-gray-500 py-2">No chat rooms available</p>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="friend"
                onClick={() => handleOpenChat(room.name)}
              >
                <div className="avatar-container">
                  {/* <img
                    src="/default-avatar.png"
                    alt={room.name}
                    className="avatar"
                  /> */}
                  <span className="online-badge"></span>
                </div>
                <span className="username">{room.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      
    </div>
  );
};

export default RightBar;