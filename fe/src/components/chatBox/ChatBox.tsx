import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import { fetchMessages, sendMessage } from "../../redux/messageSlice";
import { ClipLoader } from "react-spinners";

interface Sender {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  activeStatus: string;
  gender: string;
  phone: string;
  birthDate: string;
  bio: string;
  avatar: string;
}

interface Message {
  id: number;
  sender: Sender;
  content: string;
}

interface ChatBoxProps {
  username: string;
  senderId: number;
  roomId: number;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ username, senderId, roomId, onClose }) => {
  const dispatch = useAppDispatch();
  const { messages, isLoading, error } = useAppSelector((state) => state.message);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    dispatch(fetchMessages({ senderId, page: 0, size: 20, sort: "createdAt,asc", paged: true }));
  }, [dispatch, senderId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending:", { senderId, roomId, content: newMessage });
      dispatch(
        sendMessage({
          senderId,
          roomId,
          content: newMessage,
        })
      )
        .unwrap()
        .then(() => {
          console.log("Message sent successfully");
          setNewMessage("");
        })
        .catch((err) => {
          console.error("Error sending message:", err);
        });
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 h-96 bg-white border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-500 text-white p-3 rounded-t-lg">
        <span>Chat với {username}</span>
        <button onClick={onClose} className="text-lg font-bold">
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-3 h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-2">
            <ClipLoader size={20} color="#3b82f6" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-2">{error}</div>
        ) : messages.length === 0 ? (
          <p className="text-gray-600 text-sm">No messages yet.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 p-2 rounded-md ${
                message.sender.id === senderId ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
              }`}
            >
              <p className="text-sm">
                <strong>
                  {message.sender.firstName} {message.sender.lastName || ""}:
                </strong>{" "}
                {message.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex p-3 border-t">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;