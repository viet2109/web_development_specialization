import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { fetchChatRooms, mapRoomToContact } from '../../api/message';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Contact } from '../../types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { webSocketService } from '../../api/socket';

interface MessagesProps {
  onSelectContact: (contact: Contact) => void;
}

const Messages: React.FC<MessagesProps> = ({ onSelectContact }) => {
  const contactsContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.id;
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isLoading, isError, error, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['chatRooms', currentUserId],
    queryFn: async ({ pageParam = 0 }) => {
      if (typeof currentUserId !== 'number') {
        throw new Error('Người dùng chưa đăng nhập hoặc thiếu thông tin ID.');
      }
      const response = await fetchChatRooms({
        memberId: currentUserId,
        page: pageParam as number,
        size: 10,
        sort: ['createdAt', 'desc'],
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
        queryClient.setQueryData(['chatRooms', currentUserId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              contacts: page.contacts.map((contact: Contact) =>
                contact.id === Number(update.roomId)
                  ? { ...contact, lastMessage: update.lastMessage, time: update.time }
                  : contact
              ),
            })),
          };
        });
      }
    );

    return () => unsubscribe();
  }, [currentUserId, queryClient]);

  // Infinite scroll for contacts
  useEffect(() => {
    const handleScroll = () => {
      if (contactsContainerRef.current && hasNextPage && !isFetchingNextPage) {
        const { scrollTop, scrollHeight, clientHeight } = contactsContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          fetchNextPage();
        }
      }
    };

    const container = contactsContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <div className="p-4">Đang tải...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Lỗi: {(error as Error).message}</div>;
  }

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header + Search */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Đoạn chat</h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trên Messenger"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Danh sách đoạn chat */}
      <div ref={contactsContainerRef} className="flex-1 overflow-y-auto">
        {isFetchingNextPage && (
          <div className="text-center text-gray-500 text-sm p-4">Đang tải thêm đoạn chat...</div>
        )}
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => onSelectContact(contact)}
          >
            {/* Avatar + trạng thái online */}
            <div className="relative w-12 h-12">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {contact.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Thông tin người dùng */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-900 truncate">{contact.name}</p>
                <span className="text-xs text-gray-400">{contact.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;