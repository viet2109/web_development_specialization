import { getLinkPreview } from "link-preview-js";
import React from "react";
interface ChatBoxProps {
  username: string;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ username, onClose }) => {
  getLinkPreview("https://www.youtube.com/watch?v=MejbOFk7H6c").then((data) =>
    console.debug(data)
  );

  return (
    <div className="fixed bottom-5 right-5 w-80 h-96 bg-white border rounded-lg shadow-lg ">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-500 text-white p-3 rounded-t-lg">
        <span>Chat với {username}</span>
        <button onClick={onClose} className="text-lg font-bold">
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-3 h-66 overflow-y-auto">
        <p className="text-gray-600 text-sm">
          Hộp thoại chat với {username}...
        </p>
      </div>

      {/* Footer */}
      <div className="flex p-3 border-t">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600">
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
