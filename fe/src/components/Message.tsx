import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Video,
  X,
  Mic,
  Image,
  Sticker,
  Send,
  Smile,
  Info,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Contact, Message } from "../types";
import { fetchMessages, formatTime, sendMessage } from "../api/message";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { webSocketService } from "../api/socket";

interface ChatBoxProps {
  contact: Contact;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ contact, onClose }) => {
  const [message, setMessage] = useState("");
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.id;
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    refetch,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", contact.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (currentUserId === undefined) {
        throw new Error("Người dùng chưa đăng nhập.");
      }
      const response = await fetchMessages(contact.id, {
        page: pageParam,
        size: 50,
        sort: ["createdAt,asc"],
      });
      return {
        messages: response.content.map((msg) => ({
          id: msg.id,
          fromMe: msg.sender.id === currentUserId,
          type:
            msg.attachments.length > 0 ? ("image" as const) : ("text" as const),
          content:
            msg.attachments.length > 0 ? msg.attachments[0].url : msg.content,
          createdAt: msg.createdAt,
        })),
        page: pageParam,
        totalPages: response.totalPages,
      };
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled: !!currentUserId,
    retry: 2,
    initialPageParam: 0,
    refetchInterval: 10000, // Refetch every 10 seconds as fallback
  });

  const messages = data?.pages.flatMap((page) => page.messages) || [];

  // WebSocket subscription for real-time messages
  useEffect(() => {
    console.log(`Subscribing to room: ${contact.id}`); // Debug subscription
    const unsubscribe = webSocketService.subscribeToRoom(
      String(contact.id),
      (newMsg: Message) => {
        console.log("Received WebSocket message:", newMsg); // Debug received message
        queryClient.setQueryData(["messages", contact.id], (oldData: any) => {
          if (!oldData) {
            return {
              pages: [{ messages: [newMsg], page: 0, totalPages: 1 }],
              pageParams: [0],
            };
          }
          const lastPage = oldData.pages[0];
          // Prevent duplicate messages
          if (lastPage.messages.some((msg: Message) => msg.id === newMsg.id)) {
            return oldData;
          }
          return {
            ...oldData,
            pages: [
              {
                ...lastPage,
                messages: [...lastPage.messages, newMsg],
              },
              ...oldData.pages.slice(1),
            ],
          };
        });

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    );

    return () => {
      console.log(`Unsubscribing from room: ${contact.id}`); // Debug unsubscription
      unsubscribe();
    };
  }, [contact.id, queryClient]);

  // WebSocket connection and error handling
  useEffect(() => {
    const unsubscribeError = webSocketService.onError((error) => {
      console.error("WebSocket error:", error);
      alert(`Lỗi kết nối WebSocket: ${error}`);
    });

    const unsubscribeConnect = webSocketService.onConnect(() => {
      console.log(
        "WebSocket connected, ensuring subscription for room:",
        contact.id
      );
    });

    return () => {
      unsubscribeError();
      unsubscribeConnect();
    };
  }, [contact.id]);

  // Scroll to top for older messages
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current && hasNextPage && !isFetchingNextPage) {
        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop < 100) {
          const prevHeight = messagesContainerRef.current.scrollHeight;
          fetchNextPage().then(() => {
            if (messagesContainerRef.current) {
              const newHeight = messagesContainerRef.current.scrollHeight;
              messagesContainerRef.current.scrollTop =
                newHeight - prevHeight + scrollTop;
            }
          });
        }
      }
    };

    const container = messagesContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      roomId,
      content,
      files,
    }: {
      roomId: string;
      content: string;
      files: File[];
    }) => {
      return await sendMessage({ roomId: Number(roomId), content, files });
    },
    onMutate: async ({ roomId, content, files }) => {
      // Optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticMessage: Message = {
        id: Number(tempId),
        fromMe: true,
        type: files.length > 0 ? "image" : "text",
        content: files.length > 0 ? URL.createObjectURL(files[0]) : content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages", roomId], (oldData: any) => {
        if (!oldData) {
          return {
            pages: [{ messages: [optimisticMessage], page: 0, totalPages: 1 }],
            pageParams: [0],
          };
        }
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              messages: [...oldData.pages[0].messages, optimisticMessage],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      return { tempId };
    },
    onSuccess: async (newMessage, variables, context) => {
      const msgWithAttachments = newMessage as Message & {
        attachments?: { url: string }[];
      };
      const mappedMessage: Message = {
        id: newMessage.id,
        fromMe: true,
        type: msgWithAttachments.attachments?.length ? "image" : "text",
        content:
          msgWithAttachments.attachments?.[0]?.url ||
          msgWithAttachments.content,
        createdAt: msgWithAttachments.createdAt,
      };

      // Replace optimistic message
      queryClient.setQueryData(
        ["messages", variables.roomId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((msg: Message) =>
                String(msg.id) === String(context.tempId) ? mappedMessage : msg
              ),
            })),
          };
        }
      );

      // Refetch to ensure sync with server
      await refetch();

      // Invalidate chat rooms to update lastMessage in MessengerUI
      queryClient.invalidateQueries({ queryKey: ["chatRooms", currentUserId] });
    },
    onError: (err: any, variables, context) => {
      // Roll back optimistic update
      queryClient.setQueryData(
        ["messages", variables.roomId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              messages: page.messages.filter(
                (msg: Message) =>
                  !context || String(msg.id) !== String(context.tempId)
              ),
            })),
          };
        }
      );
      alert(err.message || "Đã xảy ra lỗi khi gửi tin nhắn.");
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() && !fileToSend) return;

    sendMessageMutation.mutate({
      roomId: String(contact.id),
      content: message,
      files: fileToSend ? [fileToSend] : [],
    });

    setMessage("");
    setFileToSend(null);
    setPreviewImage(null);
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.type === "image") {
      return (
        <img
          src={msg.content}
          alt="Hình ảnh"
          onClick={() => setPreviewImage(msg.content)}
          className="rounded-lg max-w-[160px] max-h-40 object-cover cursor-pointer hover:opacity-90 transition"
        />
      );
    }
    return <div className="whitespace-pre-wrap break-words">{msg.content}</div>;
  };

  if (isLoading)
    return (
      <div className="p-4 bg-gray-900 text-gray-100">Đang tải tin nhắn...</div>
    );
  if (isError)
    return (
      <div className="p-4 bg-gray-900 text-red-400">
        Lỗi: {(error as Error).message}
      </div>
    );

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col text-gray-100 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {contact.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {contact.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-sm">
              {contact.name}
            </h3>
            <p className="text-gray-400 text-xs">
              {contact.isOnline
                ? "Đang hoạt động"
                : `Hoạt động ${formatTime(
                    messages[messages.length - 1]?.createdAt ||
                      new Date().toISOString()
                  )}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <Video className="w-5 h-5 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <Info className="w-5 h-5 text-gray-400" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 px-4 py-4 overflow-y-auto bg-gray-900 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {isFetchingNextPage && (
          <div className="text-center text-gray-400 text-sm">
            Đang tải thêm tin nhắn...
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-sm rounded-2xl leading-relaxed shadow-sm ${
                msg.fromMe
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700"
              }`}
            >
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        {messages.length > 0 && (
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              Đã gửi {formatTime(messages[messages.length - 1].createdAt)}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <Smile className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Aa"
              className="w-full px-4 py-2.5 rounded-full bg-gray-700 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600 transition-all border border-gray-600"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <input
            type="file"
            id="upload-file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFileToSend(file);
              }
            }}
          />
          <label
            htmlFor="upload-file"
            className="p-2 hover:bg-gray-700 rounded-full cursor-pointer transition-colors"
          >
            <Image className="w-5 h-5 text-gray-400" />
          </label>
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <Sticker className="w-5 h-5 text-gray-400" />
          </button>
          <button
            className="p-2 hover:bg-blue-600 rounded-full transition-colors bg-blue-500"
            onClick={handleSendMessage}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {fileToSend && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-300 bg-gray-700 px-3 py-2 rounded-lg">
            <span>📎 {fileToSend.name}</span>
            <button
              onClick={() => setFileToSend(null)}
              className="text-red-400 hover:text-red-300 hover:underline transition-colors"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
