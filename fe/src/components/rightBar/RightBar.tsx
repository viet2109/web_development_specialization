import React, { useEffect } from "react";
import "../rightBar/RightBar.css";
import ChatBox from "../chatBox/ChatBox";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import {
  fetchFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  resetError,
} from "../../redux/friendRequestSlice";
import { ClipLoader } from "react-spinners";

const RightBar: React.FC = () => {
  const [openChat, setOpenChat] = React.useState(false);
  const [chatUser, setChatUser] = React.useState("");
  const dispatch = useAppDispatch();
  
  const { 
    requests, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.friendRequest);

  useEffect(() => {
    dispatch(fetchFriendRequests({ page: 0, size: 10 }));
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
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <ClipLoader size={20} color="#3b82f6" />
            </div>
          ) : error ? (
            <div className="error-message">
              {error}
              <button 
                onClick={() => dispatch(resetError())}
                className="dismiss-btn"
              >
                Dismiss
              </button>
            </div>
          ) : requests.length === 0 ? (
            <p className="text-gray-500 py-2">No friend requests</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="user-request">
                <div className="user-info">
                  <img 
                    src={request.senderProfilePic || "/default-avatar.png"} 
                    alt={request.senderUsername}
                    className="avatar"
                  />
                  <span>{request.senderUsername}</span>
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

        {/* Latest Activities Section */}
        {/* <div className="item">
          <span>Latest Activities</span>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="activity">
              <div className="user-info">
                <img
                  src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg"
                  alt={`User ${item}`}
                />
                <p>
                  <span>User {item}</span> updated their profile
                </p>
              </div>
              <span>1 min ago</span>
            </div>
          ))}
        </div> */}

        {/* Online Friends Section */}
        {/* <div className="item online-friends">
          <span>Online Friends</span>
          {[5, 6, 7, 8].map((item) => (
            <div 
              key={item} 
              className="friend"
              onClick={() => handleOpenChat(`User${item}`)}
            >
              <div className="avatar-container">
                <img
                  src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg"
                  alt={`User ${item}`}
                  className="avatar"
                />
                <span className="online-badge"></span>
              </div>
              <span className="username">User{item}</span>
            </div>
          ))}
        </div> */}
      </div>

      {/* Chat Box */}
      {openChat && (
        <ChatBox 
          username={chatUser} 
          onClose={() => setOpenChat(false)} 
        />
      )}
    </div>
  );
};

export default RightBar;