import React, { useState } from "react";
import "../rightBar/RightBar.css";
import ChatBox from "../chatBox/ChatBox";

const RightBar: React.FC = () => {
  const [openChat, setOpenChat] = useState(false);
  const [chatUser, setChatUser] = useState("");

  const handleOpenChat = (username: string) => {
    setChatUser(username);
    setOpenChat(true);
  };
 
  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="User 1"
              />
              <span>Test User 1</span>
            </div>
            <div className="buttons">
              <button>follow</button>
              <button>dismiss</button>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="User 2"
              />
              <span>TestUser2</span>
            </div>
            <div className="buttons">
              <button>follow</button>
              <button>dismiss</button>
            </div>
          </div>
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