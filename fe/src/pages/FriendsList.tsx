import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { debounce } from "lodash";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiTrash2,
  FiLoader as Loader,
  FiMessageCircle as MessageCircle,
  FiMoreVertical as MoreVertical,
  FiSearch as Search,
  FiUsers as Users,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { VirtuosoGrid } from "react-virtuoso";
import Swal from "sweetalert2";
import { deleteFriendship, fetchFriendships } from "../api/friendship";
import { RootState } from "../redux/store";
import { FriendshipFilter, User } from "../types";

const FriendsList: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "ONLINE" | "OFFLINE"
  >("ALL");
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const debouncedSetSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  const apiFilter = useMemo<FriendshipFilter>(
    () => ({
      name: debouncedSearchTerm.trim() || undefined,
      size: 10,
    }),
    [debouncedSearchTerm]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["friendships", apiFilter],
    queryFn: ({ pageParam = 0 }) =>
      fetchFriendships({ ...apiFilter, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page } = lastPage;
      return page.number < page.totalPages - 1 ? page.number + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // Mutation để xóa bạn bè
  const deleteFriendMutation = useMutation({
    mutationFn: deleteFriendship,
    onSuccess: () => {
      // Invalidate và refetch friendships query
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      toast.success("Đã xóa bạn bè thành công!");
    },
    onError: (error: any) => {
      console.error("Delete friend error:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa bạn bè";
      toast.error(errorMessage);

      // Hiển thị lỗi bằng SweetAlert2
      Swal.fire({
        title: "Lỗi!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Đóng",
      });
    },
  });

  const allFriends = useMemo(() => {
    if (!data?.pages) return [];

    const friendsFromFriendships: (User & { friendshipId: number })[] = [];

    data.pages.forEach((page) => {
      page.content.forEach((friendship) => {
        const friend =
          friendship.user1.id === currentUser?.id
            ? friendship.user2
            : friendship.user1;
        friendsFromFriendships.push({
          ...friend,
          friendshipId: friendship.id, // Lưu friendshipId để xóa
        });
      });
    });

    return friendsFromFriendships;
  }, [data, currentUser?.id]);

  const filteredFriends = useMemo(() => {
    return allFriends.filter((friend) => {
      if (filterStatus === "ALL") return true;
      return friend.activeStatus === filterStatus;
    });
  }, [allFriends, filterStatus]);

  const totalFriends = useMemo(
    () => data?.pages[0]?.page.totalElements,
    [data]
  );

  const isSearching = searchTerm !== debouncedSearchTerm;

  const FriendCard = useCallback(
    ({ index }: { index: number }) => {
      const friend = filteredFriends[index];
      const [showDropdown, setShowDropdown] = useState(false);
      const dropdownRef = useRef<HTMLDivElement>(null);

      if (!friend) return null;

      // Close dropdown when clicking outside
      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
          ) {
            setShowDropdown(false);
          }
        };

        if (showDropdown) {
          document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [showDropdown]);

      const handleDeleteFriend = async () => {
        try {
          const result = await Swal.fire({
            title: "Xác nhận xóa bạn bè",
            html: `Bạn có chắc chắn muốn xóa <strong>${friend.firstName} ${friend.lastName}</strong> khỏi danh sách bạn bè?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Xóa bạn",
            cancelButtonText: "Hủy",
            reverseButtons: true,
            focusCancel: true,
          });

          if (result.isConfirmed) {
            await deleteFriendMutation.mutateAsync(friend.friendshipId);
            setShowDropdown(false);

            // Hiển thị thông báo thành công bằng SweetAlert2
            Swal.fire({
              title: "Đã xóa!",
              text: `${friend.firstName} ${friend.lastName} đã được xóa khỏi danh sách bạn bè.`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            setShowDropdown(false);
          }
        } catch (error) {
          // Error đã được handle trong onError của mutation
          setShowDropdown(false);
        }
      };

      return (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:translate-y-1 group h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <img
                src={
                  friend.avatar?.path ||
                  `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}&background=3b82f6&color=ffffff&size=64`
                }
                alt={`${friend.firstName} ${friend.lastName}`}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 shadow-sm"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                  friend.activeStatus === "ONLINE"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
            </div>

            {/* Dropdown Menu Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100"
                disabled={deleteFriendMutation.isPending}
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
                  <button
                    onClick={handleDeleteFriend}
                    disabled={deleteFriendMutation.isPending}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-150 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteFriendMutation.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    <span>
                      {deleteFriendMutation.isPending
                        ? "Đang xóa..."
                        : "Xóa bạn"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
              {friend.firstName} {friend.lastName}
            </h3>
            <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">
              {friend.email}
            </p>
            <p className="text-sm line-clamp-2 text-gray-700 dark:text-gray-300">
              {friend.bio}
            </p>
          </div>

          <div className="flex items-center text-xs mb-4 text-gray-500 dark:text-gray-400">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                friend.activeStatus === "ONLINE"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
            {friend.activeStatus === "ONLINE"
              ? "Đang hoạt động"
              : `Hoạt động ${formatDistanceToNow(friend.lastActive, {
                  addSuffix: true,
                  locale: vi,
                })}`}
          </div>

          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
              <MessageCircle className="w-4 h-4" />
              <span>Nhắn tin</span>
            </button>
          </div>
        </div>
      );
    },
    [filteredFriends, deleteFriendMutation]
  );

  const endReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Đang tải danh sách bạn bè...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không thể tải danh sách bạn bè
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error?.message || "Đã xảy ra lỗi khi tải dữ liệu"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-screen">
      <div className="sticky top-16 z-20 backdrop-blur-lg mb-6">
        <div className="flex items-center justify-between mb-6 pt-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Danh sách bạn bè
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Quản lý và kết nối với bạn bè của bạn
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {totalFriends ? (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
                {totalFriends} bạn bè
              </span>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              {isSearching && (
                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
              )}
              <input
                type="text"
                placeholder="Tìm kiếm bạn bè..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            <div className="flex space-x-2">
              {(["ALL", "ONLINE", "OFFLINE"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600"
                  }`}
                >
                  {status === "ALL"
                    ? "Tất cả"
                    : status === "ONLINE"
                    ? "Trực tuyến"
                    : "Ngoại tuyến"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex-1 flex">
        {filteredFriends.length === 0 ? (
          <div className="bg-white/60 w-full max-h-fit  dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? "Không tìm thấy bạn bè" : "Chưa có bạn bè nào"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác"
                : "Hãy kết bạn để xây dựng mạng lưới của bạn"}
            </p>
          </div>
        ) : (
          <VirtuosoGrid
            totalCount={filteredFriends.length}
            components={{
              List: React.forwardRef<
                HTMLDivElement,
                React.HTMLAttributes<HTMLDivElement>
              >((props, ref) => (
                <div
                  ref={ref}
                  {...props}
                  className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
                  style={{
                    ...props.style,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "1.5rem",
                  }}
                />
              )),
              Item: ({ children, ...props }) => (
                <div {...props} style={{ ...props.style }}>
                  {children}
                </div>
              ),
              Footer: () =>
                isFetchingNextPage ? (
                  <div className="p-4 text-center">
                    <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Đang tải thêm...
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                    Bạn đã xem hết danh sách
                  </div>
                ),
            }}
            itemContent={(index) => <FriendCard index={index} />}
            endReached={endReached}
            overscan={5}
            style={{
              scrollbarWidth: "none",
              height: "auto",
              display: "flex",
              flex: "1",
            }}
          />
        )}

        {isFetchingNextPage && (
          <div className="flex justify-center mt-4 p-4">
            <div className="flex items-center space-x-2 text-blue-500">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Đang tải thêm bạn bè...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
