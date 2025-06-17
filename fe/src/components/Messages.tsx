import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageCircle, Search } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { fetchChatRooms, mapRoomToContact } from "../api/message";
import { webSocketService } from "../api/socket";
import { RootState } from "../redux/store";
import { Contact } from "../types";

interface MessagesProps {
  onSelectContact: (contact: Contact) => void;
}

const Messages: React.FC<MessagesProps> = ({ onSelectContact }) => {
  const contactsContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.id;
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["chatRooms", currentUserId],
    queryFn: async ({ pageParam = 0 }) => {
      if (typeof currentUserId !== "number") {
        throw new Error("Người dùng chưa đăng nhập hoặc thiếu thông tin ID.");
      }
      const response = await fetchChatRooms({
        memberId: currentUserId,
        page: pageParam as number,
        size: 10,
        sort: ["createdAt", "desc"],
      });
      const contacts = await Promise.all(
        response.content.map((room) => mapRoomToContact(room, currentUserId))
      );
      return {
        contacts,
        page: pageParam as number,
        totalPages: response.totalPages,
      };
    },
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 0,
    enabled: !!currentUserId,
    retry: 2,
  });

  const contacts = data?.pages.flatMap((page) => page.contacts) || [];

  // WebSocket subscription for room updates
  useEffect(() => {
    const unsubscribe = webSocketService.subscribeToRoomUpdates(
      (update: { roomId: string; lastMessage: string; time: string }) => {
        queryClient.setQueryData(
          ["chatRooms", currentUserId],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                contacts: page.contacts.map((contact: Contact) =>
                  contact.id === Number(update.roomId)
                    ? {
                        ...contact,
                        lastMessage: update.lastMessage,
                        time: update.time,
                      }
                    : contact
                ),
              })),
            };
          }
        );
      }
    );

    return () => unsubscribe();
  }, [currentUserId, queryClient]);

  // Infinite scroll for contacts
  useEffect(() => {
    const handleScroll = () => {
      if (contactsContainerRef.current && hasNextPage && !isFetchingNextPage) {
        const { scrollTop, scrollHeight, clientHeight } =
          contactsContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          fetchNextPage();
        }
      }
    };

    const container = contactsContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-300">
            Đang tải đoạn chat...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <MessageCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-500 dark:text-red-400 font-medium">
            Có lỗi xảy ra
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
      {/* Header với gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Đoạn chat
          </h1>
        </div>

        {/* Search bar với shadow */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm tin nhắn, bạn bè..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white
                     shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>
      </div>

      {/* Danh sách đoạn chat với custom scrollbar */}
      <div
        ref={contactsContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {contacts.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Chưa có đoạn chat nào.
              <br />
              Bắt đầu cuộc trò chuyện đầu tiên!
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="group flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 
                         cursor-pointer transition-all duration-200 hover:shadow-sm"
                onClick={() => onSelectContact(contact)}
              >
                {/* Avatar với status indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {contact.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>

                {/* Thông tin contact */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {contact.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate leading-relaxed">
                    {contact.lastMessage}
                  </p>
                </div>

                {/* Unread indicator (nếu có) */}
                {/* Có thể thêm logic để hiển thị số tin nhắn chưa đọc */}
                {Math.random() > 0.7 && ( // Demo random unread indicator
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator cho infinite scroll */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Đang tải thêm...
            </span>
          </div>
        )}
      </div>

      {/* Floating action button (tuỳ chọn) */}
      <div className="absolute bottom-6 right-6">
        <button
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                         text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 
                         flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Messages;
