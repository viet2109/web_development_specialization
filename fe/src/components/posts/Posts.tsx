import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Virtuoso } from "react-virtuoso";
import { api } from "../../api/api";
import routers from "../../configs/router";
import { useAppSelector } from "../../hook/hook";
import { Page, Post } from "../../types";
import PostCom from "../post/Post";

const Posts = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const nav = useNavigate();
  const [windowHeight, setWindowHeight] = useState<number>(
    window.innerHeight * 2
  );
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery<Page<Post>, Error>({
    queryKey: ["posts", "feed"],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response = await api.get(`/posts/feed?page=${pageParam}&size=5`);
        return response.data;
      } catch (err) {
        console.error("Error fetching posts:", err);
        throw err;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { page } = lastPage;
      return page.number + 1 < page.totalPages ? page.number + 1 : undefined;
    },
    enabled: !!currentUser,
  });

  // Flatten all posts from all pages
  const allPosts = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  useEffect(() => {
    setWindowHeight(window.innerHeight * 2);
  }, [data]);

  // Login required state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 max-w-md w-full text-center border dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Đăng nhập để tiếp tục
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Bạn cần đăng nhập để xem và tương tác với các bài viết
          </p>
          <button
            onClick={() => {
              nav(routers.login);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 max-w-md w-full text-center border dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6 mb-6 animate-pulse border dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        <div className="ml-3 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
      <div className="h-48 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
    </div>
  );

  // Loading more component
  const LoadingMore = () => (
    <div className="flex justify-center items-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      <span className="ml-2 text-gray-600 dark:text-gray-300">
        Đang tải thêm...
      </span>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-12 text-center border dark:border-gray-700">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-10 h-10 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m1.5-2-1.5 1.5-1.5-1.5M21 15l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        Chưa có bài viết nào
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Hãy bắt đầu tạo bài viết đầu tiên của bạn hoặc theo dõi thêm bạn bè
      </p>
      <button
        onClick={() => refetch()}
        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md dark:shadow-lg"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Làm mới
      </button>
    </div>
  );

  // Item renderer for virtuoso
  const itemContent = useCallback(
    (index: number) => {
      const post = allPosts[index];
      if (!post) return null;

      return (
        <div className="mb-6">
          <div className="transform transition-all duration-200 hover:shadow-lg dark:hover:shadow-2xl">
            <PostCom post={post} />
          </div>
        </div>
      );
    },
    [allPosts]
  );

  // End reached handler
  const endReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Header component
  const Header = () => (
    <div className="mb-6 mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Bảng tin
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Khám phá những bài viết mới nhất từ cộng đồng
        </p>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md dark:shadow-lg"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Làm mới
        </button>
      </div>
    </div>
  );

  // Footer component
  const Footer = () => {
    if (isFetchingNextPage) {
      return <LoadingMore />;
    } else if (!hasNextPage) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 pb-6">
          Bạn đã xem hết các bài viết mới
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="max-w-2xl flex-1">
        {isLoading ? (
          <div className="py-8">
            <Header />
            <div className="px-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : allPosts.length === 0 ? (
          <div className="py-8">
            <Header />
            <div className="px-4">
              <EmptyState />
            </div>
          </div>
        ) : (
          <Virtuoso
            style={{ scrollbarWidth: "none" }}
            totalCount={allPosts.length}
            endReached={endReached}
            firstItemIndex={0}
            components={{
              Header,
              Footer,
            }}
            computeItemKey={(_index, post) => post.id}
            initialTopMostItemIndex={
              allPosts && allPosts.length ? 0 : allPosts.length - 1
            }
            followOutput="smooth"
            data={allPosts}
            overscan={windowHeight}
            itemContent={itemContent}
          />
        )}
      </div>
    </div>
  );
};

export default Posts;
