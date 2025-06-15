import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "../../api/api";
import { useAppSelector } from "../../hook/hook";
import PostCom from "../post/Post";
import { Post } from "../../types";
import { useNavigate } from "react-router";
import routers from "../../configs/router";

const Posts = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
const nav = useNavigate();
  const { isLoading, error, data, refetch } = useQuery<Post[]>({
    queryKey: ["posts", "feed", token],
    queryFn: async () => {
      try {
        const response = await api.get("/posts/feed?page=0&size=10");
        return response.data.content || response.data;
      } catch (err) {
        console.error("Error fetching posts:", err);
        throw err;
      }
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  // Login required state
  if (!currentUser || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đăng nhập để tiếp tục
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để xem và tương tác với các bài viết
          </p>
          <button onClick={() => {nav(routers.login)}} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-pulse"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const mappedPosts: Post[] = (data ?? []).map((post: Post) => ({
    id: post.id,
    creator: post.creator,
    content: post.content,
    attachments: post.attachments,
    reactionSummary: post.reactionSummary,
    sharedPost: post.sharedPost,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    totalComments: post.totalComments,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Bảng tin</h1>
            <p className="text-gray-600 mb-4">
              Khám phá những bài viết mới nhất từ cộng đồng
            </p>

            {/* Refresh button */}
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
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

        {/* Posts */}
        <div className="space-y-6">
          {mappedPosts && mappedPosts.length > 0 ? (
            mappedPosts.map((post) => (
              <div
                key={post.id}
                className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <PostCom post={post} />
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
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
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy bắt đầu tạo bài viết đầu tiên của bạn hoặc theo dõi thêm bạn
                bè
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
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
          )}
        </div>

        {/* Load more hint */}
        {mappedPosts && mappedPosts.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Cuộn xuống để xem thêm bài viết
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
