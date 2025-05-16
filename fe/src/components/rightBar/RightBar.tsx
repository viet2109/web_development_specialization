import React, { useEffect, useState } from "react";
import "../rightBar/RightBar.css";
import ChatBox from "../chatBox/ChatBox";
import { useAppDispatch, useAppSelector } from "../../hook/hook";

import { fetchFriendRequests,resetError } from "../../redux/friendRequestSlice";
import { api } from "../../api/api";

const RightBar: React.FC = () => {
  const [openChat, setOpenChat] = useState(false);
  const [chatUser, setChatUser] = useState("");
  const dispatch = useAppDispatch();
    const { requests, isLoading, error } = useAppSelector((state) => state.friendRequest);

  const handleOpenChat = (username: string) => {
    setChatUser(username);
    setOpenChat(true);
  };
  useEffect(() => {
    dispatch(fetchFriendRequests({ page: 0, size: 10 }));
  }, [dispatch]);


  const handleAccept = async (id: number) => {
    try {
      await api.post(`/friend-requests/${id}/accept`);
      dispatch(fetchFriendRequests({ page: 0, size: 10 }));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await api.delete(`/friend-requests/${id}`);
      dispatch(fetchFriendRequests({ page: 0, size: 10 }));
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  }
  
 
  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Friend Requests</span>
          {isLoading && <p>Loading...</p>}
          {error && (
            <div className="flex items-center text-red-500 text-sm mb-4">
              <span>{error}</span>
              <button
                onClick={() => dispatch(resetError())}
                className="ml-2 text-blue-500 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
          {requests.length === 0 && !isLoading && <p>No friend requests</p>}
          {requests.map((request) => (
            <div key={request.id} className="user">
              <div className="userInfo">
                <span>{request.senderUsername}</span>
              </div>
              <div className="buttons">
                <button onClick={() => handleAccept(request.id)}>Accept</button>
                <button onClick={() => handleDecline(request.id)}>Decline</button>
              </div>
            </div>
          ))}
        </div>
        <div className="item">
          <span>Latest Activities</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="User 3"
              />
              <p>
                <span>Test User 3</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="User 4"
              />
              <p>
                <span>TestUser4</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="User 5"
              />
              <p>
                <span>Test User 5</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="User 6"
              />
              <p>
                <span>TestUser6</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
        </div>
        <div className="p-4">
      <div className="mb-4 text-lg font-semibold">Online Friends</div>
      <div
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 cursor-pointer transition"
        onClick={() => handleOpenChat("TestUser7")}
      >
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="User 7"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <span className="text-gray-800 font-medium">TestUser7</span>
      </div>
      <div
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 cursor-pointer transition"
        onClick={() => handleOpenChat("TestUser8")}
      >
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="User 7"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <span className="text-gray-800 font-medium">TestUser8</span>
      </div>
      <div
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 cursor-pointer transition"
        onClick={() => handleOpenChat("TestUser9")}
      >
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="User 7"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <span className="text-gray-800 font-medium">TestUser9</span>
      </div>
      <div
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 cursor-pointer transition"
        onClick={() => handleOpenChat("TestUser10")}
      >
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="User 7"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <span className="text-gray-800 font-medium">TestUser10</span>
      </div>
      <div
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 cursor-pointer transition"
        onClick={() => handleOpenChat("TestUser11")}
      >
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="User 7"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <span className="text-gray-800 font-medium">TestUser11</span>
      </div>

      {openChat && <ChatBox username={chatUser} onClose={() => setOpenChat(false)} />}
    </div>
      </div>
    </div>
  );
};

export default RightBar;