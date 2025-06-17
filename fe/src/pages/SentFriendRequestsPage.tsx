import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React, { Fragment, useMemo } from "react";
import {
  RiClockwise2Line,
  RiErrorWarningFill,
  RiLoader4Line,
  RiSendPlaneFill,
  RiTimeFill,
  RiUserSearchLine,
  RiUserShared2Fill,
} from "react-icons/ri";
import { Virtuoso } from "react-virtuoso";
import { deleteRequest, getFriendRequestSent } from "../api/friendsRequest";

const SentFriendRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["sentFriendRequests"],
    queryFn: ({ pageParam = 0 }) =>
      getFriendRequestSent({
        page: pageParam,
        size: 20,
        sort: ["createdAt,desc"],
      }),
    getNextPageParam: (lastPage) => {
      const { page } = lastPage;
      return page.number < page.totalPages - 1 ? page.number + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // Mutation để hủy lời mời
  const cancelRequestMutation = useMutation({
    mutationFn: (requestId: number) => deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
    },
    onError: (error) => {
      console.error("Error canceling request:", error);
      // Có thể thêm toast notification ở đây
    },
  });

  const allItems = useMemo(() => {
    return data?.pages?.flatMap((page) => page.content) ?? [];
  }, [data]);

  const handleCancelRequest = (requestId: number) => {
    cancelRequestMutation.mutate(requestId);
  };

  const ItemRenderer = (index: number) => {
    const request = allItems[index];

    if (!request) return null;

    const user = request.receiver;

    return (
      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 dark:border-gray-700/60 p-6 hover:shadow-lg hover:bg-white/80 dark:hover:bg-gray-800/70 transition-all duration-200 my-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar.path}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-gray-600 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border-2 border-slate-200 dark:border-gray-600 shadow-sm">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </span>
                </div>
              )}
              {/* Online Status */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ${
                  user.activeStatus === "ONLINE"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <span
                  className={`text-xs line-clamp-1 px-2.5 py-1 rounded-full font-medium ${
                    user.activeStatus === "ONLINE"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {user.activeStatus === "ONLINE"
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {user.email}
              </p>

              {user.bio && (
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                  {user.bio}
                </p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="flex items-center gap-2">
                  <RiSendPlaneFill className="w-3 h-3 text-orange-500" />
                  <span>
                    Thời gian gửi:{" "}
                    {formatDistanceToNow(new Date(request.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex flex-col items-end gap-4 lg:flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
              <RiTimeFill className="w-4 h-4" />
              Đang chờ phản hồi
            </div>

            <button
              onClick={() => handleCancelRequest(request.id)}
              disabled={cancelRequestMutation.isPending}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {cancelRequestMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  Đang hủy...
                </span>
              ) : (
                "Hủy lời mời"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Fragment>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex gap-3 items-center">
            <div className="p-2 w-10 h-10 flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl">
              <RiUserShared2Fill className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lời mời đã gửi
                </h1>
                <div className="bg-gray-200 dark:bg-gray-700 w-8 h-6 rounded-full animate-pulse" />
              </div>
              <p className="text-gray-600 text-sm dark:text-gray-400 mt-0.5">
                Quản lý các lời mời kết bạn bạn đã gửi
              </p>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-gray-800/50 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                </div>
                <div className="w-24 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </Fragment>
    );
  }

  if (isError) {
    return (
      <Fragment>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex gap-3 items-center">
            <div className="p-2 w-10 h-10 flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl">
              <RiUserShared2Fill className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lời mời đã gửi
              </h1>
              <p className="text-gray-600 text-sm dark:text-gray-400 mt-0.5">
                Quản lý các lời mời kết bạn bạn đã gửi
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 text-red-400 dark:text-red-500 mb-6">
            <RiErrorWarningFill className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Không thể tải danh sách lời mời đã gửi. Vui lòng thử lại sau.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors"
          >
            Thử lại
          </button>
        </div>
      </Fragment>
    );
  }

  const totalCount = data?.pages?.[0]?.page?.totalElements ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex gap-3 items-center">
          <div className="p-2 w-10 h-10 flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl">
            <RiUserShared2Fill className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lời mời đã gửi
              </h1>
              {totalCount ? (
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium px-3 py-1.5 rounded-full">
                  {totalCount}
                </span>
              ) : (
                <></>
              )}
            </div>
            <p className="text-gray-600 text-sm dark:text-gray-400 mt-0.5">
              Quản lý các lời mời kết bạn bạn đã gửi
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {allItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 text-gray-400 dark:text-gray-500 mb-6">
            <RiUserSearchLine className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Chưa gửi lời mời nào
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Bạn chưa gửi lời mời kết bạn nào. Hãy tìm kiếm và kết nối với bạn bè
            mới!
          </p>
        </div>
      ) : (
        /* Virtualized List */
        <div className="flex flex-1">
          <Virtuoso
            style={{ display: "flex", height: "auto", flex: "1" }}
            totalCount={allItems.length}
            itemContent={ItemRenderer}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            components={{
              Footer: () => {
                if (isFetchingNextPage) {
                  return (
                    <div className="flex justify-center py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <RiLoader4Line className="w-5 h-5 animate-spin" />
                        <span>Đang tải thêm...</span>
                      </div>
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
          />
        </div>
      )}
    </div>
  );
};

export default SentFriendRequestsPage;
