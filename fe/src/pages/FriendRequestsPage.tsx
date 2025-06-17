import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useMemo, useState } from "react";
import { MdError, MdGroup } from "react-icons/md";
import { RiUserReceived2Fill } from "react-icons/ri";
import { Virtuoso } from "react-virtuoso";
import {
  acceptRequest,
  deleteRequest,
  getFriendRequestReceived,
} from "../api/friendsRequest";
import { FriendShipRequestResponse, Pageable } from "../types";
import { toast } from "react-toastify";

const FriendRequestsPage: React.FC = () => {
  const [loading, setLoading] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Infinite query for friend requests
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["friendRequestsReceived"],
    queryFn: ({ pageParam = 0 }) => {
      const pageable: Pageable = {
        page: pageParam,
        size: 10,
        sort: ["createdAt,desc"],
      };
      return getFriendRequestReceived(pageable);
    },
    getNextPageParam: (lastPage) => {
      const { page } = lastPage;
      return page.number < page.totalPages - 1 ? page.number + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // Mutation for accepting friend request
  const acceptMutation = useMutation({
    mutationFn: acceptRequest,
    onSuccess: (_, requestId) => {
      // Remove the accepted request from the cache
      queryClient.setQueryData(["friendRequestsReceived"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            content: page.content.filter(
              (req: FriendShipRequestResponse) => req.id !== requestId
            ),
          })),
        };
      });
      setLoading(null);
      toast.success("Đã chấp nhận lời mời kết bạn!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
      });
    },
    onError: () => {
      setLoading(null);
    },
  });

  const totalCount = data?.pages?.[0]?.page?.totalElements ?? 0;

  // Mutation for declining friend request
  const declineMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: (_, requestId) => {
      // Remove the declined request from the cache
      queryClient.setQueryData(["friendRequestsReceived"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            content: page.content.filter(
              (req: FriendShipRequestResponse) => req.id !== requestId
            ),
          })),
        };
      });
      setLoading(null);
    },
    onError: () => {
      setLoading(null);
    },
  });

  // Flatten all friend requests from all pages
  const friendRequests = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  // Handle accept friend request
  const handleAccept = async (requestId: number) => {
    setLoading(requestId);
    acceptMutation.mutate(requestId);
  };

  // Handle decline friend request
  const handleDecline = async (requestId: number) => {
    setLoading(requestId);
    declineMutation.mutate(requestId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="">
        <div className="mb-8">
          <div className="flex gap-3 items-center">
            <div className="p-2 w-10 h-10 flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-xl">
              <RiUserReceived2Fill className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lời mời kết bạn
                </h1>
              </div>
              <p className="text-gray-600 text-sm dark:text-gray-400 mt-0.5">
                Quản lý các lời mời kết bạn đã nhận
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="">
        <div className="mb-8">
          <div className="flex gap-3 items-center">
            <div className="p-2 w-10 h-10 flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-xl">
              <RiUserReceived2Fill className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lời mời kết bạn
                </h1>
              </div>
              <p className="text-gray-600 text-sm dark:text-gray-400 mt-0.5">
                Quản lý các lời mời kết bạn đã nhận
              </p>
            </div>
          </div>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <MdError className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {error?.message || "Không thể tải danh sách lời mời kết bạn"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex gap-3 items-center">
          <div className="p-2 w-10 h-10 flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-xl">
            <RiUserReceived2Fill className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lời mời kết bạn
              </h1>
              {totalCount ? (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
                  {totalCount}
                </span>
              ) : (
                <></>
              )}
            </div>
            <p className="text-gray-600 text-sm dark:text-gray-400 mt-0.5">
              Quản lý các lời mời kết bạn đã nhận
            </p>
          </div>
        </div>
      </div>

      {friendRequests.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-6">
            <MdGroup className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không có lời mời kết bạn
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Bạn chưa có lời mời kết bạn nào. Hãy kết nối với bạn bè mới để mở
            rộng mạng lưới của bạn!
          </p>
        </div>
      ) : (
        /* Virtualized Friend Requests List */
        <Virtuoso
          data={friendRequests}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          itemContent={(_index, request) => (
            <div className="pb-6">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 dark:border-gray-700/60 p-6 hover:shadow-lg hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  {/* User Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {request.sender.avatar ? (
                        <img
                          src={request.sender.avatar.path}
                          alt={`${request.sender.firstName} ${request.sender.lastName}`}
                          className="w-16 h-16 rounded-full object-cover border-3 border-white dark:border-gray-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-3 border-white dark:border-gray-700 shadow-sm">
                          <span className="text-lg font-bold text-white">
                            {request.sender.firstName.charAt(0)}
                            {request.sender.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Online Status */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ${
                          request.sender.activeStatus === "ONLINE"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {request.sender.firstName} {request.sender.lastName}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            request.sender.activeStatus === "ONLINE"
                              ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {request.sender.activeStatus === "ONLINE"
                            ? "Đang hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {request.sender.email}
                      </p>

                      {request.sender.bio && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                          {request.sender.bio}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Thời gian được gửi:{" "}
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
                    <button
                      onClick={() => handleAccept(request.id)}
                      disabled={loading === request.id}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
                    >
                      {loading === request.id ? "Đang xử lý..." : "Chấp nhận"}
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      disabled={loading === request.id}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
                    >
                      {loading === request.id ? "Đang xử lý..." : "Từ chối"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          components={{
            Footer: () => {
              if (isFetchingNextPage) {
                return (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                );
              }
              return (
                <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                  Bạn đã xem hết danh sách
                </div>
              );
            },
          }}
          style={{ height: "auto", display: "flex", flex: "1" }}
        />
      )}
    </div>
  );
};

export default FriendRequestsPage;
