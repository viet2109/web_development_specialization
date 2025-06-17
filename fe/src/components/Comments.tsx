import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import EmojiPicker, { Theme } from "emoji-picker-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { BiFile } from "react-icons/bi";
import {
  FiChevronDown,
  FiHeart,
  FiImage,
  FiLoader,
  FiMessageCircle,
  FiPaperclip,
  FiSend,
  FiX,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { Virtuoso } from "react-virtuoso";
import { createComment, fetchComments, reactComment } from "../api/comment";
import { deleteReaction, updateReaction } from "../api/reaction";
import { RootState } from "../redux/store";
import {
  CommentResponse,
  CreateComment,
  ReactionResponse,
  ReactionSummary,
} from "../types";

// Loading Button Component
const LoadingButton: React.FC<{
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}> = ({
  loading,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  children,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: `bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg ${
      loading ? "from-blue-400 to-purple-400" : ""
    }`,
    secondary: `bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 shadow-sm ${
      loading ? "bg-gray-50" : ""
    }`,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${
        variantClasses[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed transform-none" : ""}`}
    >
      {loading && (
        <div className="mr-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {children}
    </button>
  );
};

const CommentItem: React.FC<{
  comment: CommentResponse;
  depth: number;
  postId: number;
  expandedReplies: Set<number>;
  replyStates: Record<
    number,
    { isOpen: boolean; content: string; attachedFile: File | null }
  >;
  showEmojiPicker: number | null;
  currentUser: any;
  onToggleReplies: (commentId: number) => void;
  onToggleReplyBox: (commentId: number) => void;
  onReplyContentChange: (commentId: number, content: string) => void;
  onSubmitReply: (comment: CommentResponse) => void;
  onClearReplyAttachment: (commentId: number) => void;
  onReplyFileAttach: (
    e: React.ChangeEvent<HTMLInputElement>,
    commentId: number
  ) => void;
  onEmojiSelect: (emojiData: any, commentId: number) => void;
  onSetShowEmojiPicker: (commentId: number | null) => void;
  createCommentMutation: any;
  replyFileInputRefs: React.MutableRefObject<
    Record<number, HTMLInputElement | null>
  >;
}> = ({
  comment,
  depth,
  postId,
  expandedReplies,
  replyStates,
  showEmojiPicker,
  currentUser,
  onToggleReplies,
  onToggleReplyBox,
  onReplyContentChange,
  onSubmitReply,
  onClearReplyAttachment,
  onReplyFileAttach,
  onEmojiSelect,
  onSetShowEmojiPicker,
  createCommentMutation,
  replyFileInputRefs,
}) => {
  const pageSize = 10;
  const isReplyExpanded = expandedReplies.has(comment.id);

  const repliesQuery = useInfiniteQuery({
    queryKey: ["replies", postId, comment.id],
    queryFn: ({ pageParam = 0 }) =>
      fetchComments(
        {
          page: pageParam,
          size: pageSize,
          parentId: comment.id,
          sort: ["createdAt,desc"],
        },
        postId
      ),
    getNextPageParam: (lastPage) => {
      const next = lastPage.page.number + 1;
      return next < lastPage.page.totalPages ? next : undefined;
    },
    initialPageParam: 0,
    enabled: isReplyExpanded,
    staleTime: 1000 * 60 * 5,
  });

  const replies =
    repliesQuery.data?.pages.flatMap((page) => page.content) || [];

  const processReactionSummary = (reactions: ReactionSummary[]) => {
    if (!reactions || reactions.length === 0)
      return { topReactions: [], otherCount: 0, totalCount: 0 };

    const sortedReactions = [...reactions].sort((a, b) => b.count - a.count);
    const topReactions = sortedReactions.slice(0, 3);
    const otherReactions = sortedReactions.slice(3);
    const otherCount = otherReactions.reduce(
      (sum, reaction) => sum + reaction.count,
      0
    );
    const totalCount = reactions.reduce(
      (sum, reaction) => sum + reaction.count,
      0
    );

    return { topReactions, otherCount, totalCount };
  };

  const renderAttachment = (attachment?: CommentResponse["attachment"]) => {
    if (!attachment) return null;
    const { file } = attachment;

    const isImage = file.type.startsWith("image");
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {isImage ? (
          <img
            src={file.path}
            alt={file.name}
            className="max-w-full h-auto max-h-60 object-contain w-full hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 hover:from-gray-100 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-blue-800/30 transition-all duration-200">
            <BiFile className="w-10 h-10 text-blue-500 dark:text-blue-400 mr-4" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReactionSummary = (
    reactions: ReactionSummary[],
    _depth: number,
    comment: CommentResponse
  ) => {
    const { topReactions, otherCount, totalCount } =
      processReactionSummary(reactions);

    if (totalCount === 0) return null;

    return (
      <div className="flex items-center space-x-2 mt-3">
        <div className="flex items-center space-x-1">
          {topReactions.map((reaction, idx) => {
            const isUserReaction =
              comment.hasReacted &&
              comment.userReactionEmoji === reaction.emoji;

            return (
              <button
                key={`${reaction.emoji}-${idx}`}
                onClick={() => {
                  // onEmojiSelect({ emoji: reaction.emoji }, comment.id)
                }}
                className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-200 border transform hover:scale-105 active:scale-95 ${
                  isUserReaction
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-md"
                    : "bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm"
                }`}
                title={`${reaction.emoji} ${reaction.count}${
                  isUserReaction ? " (Bạn đã phản ứng)" : ""
                }`}
              >
                <span className="text-base">{reaction.emoji}</span>
                <span
                  className={`font-semibold text-sm ${
                    isUserReaction
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
                >
                  {reaction.count}
                </span>
              </button>
            );
          })}

          {otherCount > 0 && (
            <button
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all duration-200 border border-gray-300 dark:border-gray-600 transform hover:scale-105 active:scale-95"
              title={`${otherCount} phản ứng khác`}
            >
              <span className="text-sm">⋯</span>
              <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                {otherCount}
              </span>
            </button>
          )}
        </div>

        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {totalCount} lượt cảm xúc
        </span>
      </div>
    );
  };

  const renderReplyBox = (comment: CommentResponse, depth: number) => {
    const replyState = replyStates[comment.id];
    if (!replyState?.isOpen) return null;

    return (
      <div
        className={`mt-4 ${
          depth > 1 ? "ml-10" : "ml-14"
        } bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm`}
      >
        <div className="flex items-start space-x-3">
          <img
            src={
              currentUser.avatar?.path ||
              `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}&background=3b82f6&color=ffffff&size=64`
            }
            alt={`avatar`}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
          />

          <div className="flex-1 space-y-3">
            <textarea
              value={replyState.content}
              onChange={(e) => onReplyContentChange(comment.id, e.target.value)}
              placeholder={`Trả lời ${comment.creator.firstName}...`}
              className="w-full px-4 py-3 resize-none border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
              rows={3}
            />

            {replyState.attachedFile && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                    {replyState.attachedFile.type.startsWith("image") ? (
                      <FiImage className="w-4 h-4 text-white" />
                    ) : (
                      <BiFile className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {replyState.attachedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(replyState.attachedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onClearReplyAttachment(comment.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                >
                  <FiX className="w-4 h-4 text-red-500 dark:text-red-400" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={(el) => {
                    replyFileInputRefs.current[comment.id] = el;
                  }}
                  onChange={(e) => onReplyFileAttach(e, comment.id)}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  onClick={() =>
                    replyFileInputRefs.current[comment.id]?.click()
                  }
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200"
                  title="Đính kèm file"
                >
                  <FiPaperclip className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleReplyBox(comment.id)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200 font-medium"
                >
                  Hủy
                </button>
                <LoadingButton
                  loading={createCommentMutation.isPending}
                  onClick={() => onSubmitReply(comment)}
                  disabled={
                    !replyState.content.trim() && !replyState.attachedFile
                  }
                  variant="primary"
                  size="sm"
                >
                  Gửi
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        depth === 0
          ? "bg-gray-100 dark:bg-gray-800"
          : "bg-gray-200 dark:bg-gray-700"
      } rounded-2xl p-4 ${
        depth === 0
          ? "shadow-md border border-gray-100 dark:border-gray-700"
          : ""
      } transition-all duration-200 hover:shadow-lg dark:hover:shadow-lg mx-6`}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={
              comment.creator.avatar?.path ||
              `https://ui-avatars.com/api/?name=${comment.creator.firstName}+${comment.creator.lastName}&background=3b82f6&color=ffffff&size=64`
            }
            alt={`avatar`}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
          />
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold line-clamp-1 text-gray-900 dark:text-gray-100">
              {comment.creator.firstName} {comment.creator.lastName}
            </h4>
            <span className="text-sm line-clamp-1 text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            {comment.parentId && (
              <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1  rounded-full">
                <span className="line-clamp-1">Phản hồi</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className={` rounded-lg p-4 mb-3 ${
              comment.parentId
                ? "dark:bg-gray-600 bg-gray-300"
                : "dark:bg-gray-700 bg-gray-200"
            }`}
          >
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
            {renderAttachment(comment.attachment)}
          </div>

          {/* Reactions */}
          {renderReactionSummary(comment.reactionSummary, depth, comment)}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-3">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newValue =
                    showEmojiPicker === comment.id ? null : comment.id;

                  onSetShowEmojiPicker(newValue);
                }}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                {comment.hasReacted ? (
                  <span className="text-sm font-medium">
                    {comment.userReactionEmoji} Đã thích
                  </span>
                ) : (
                  <>
                    <FiHeart className="w-4 h-4" />
                    <span className="text-sm font-medium">Cảm xúc</span>
                  </>
                )}
              </button>

              {showEmojiPicker === comment.id && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        onEmojiSelect(emojiData, comment.id)
                      }
                      theme={
                        window.matchMedia("(prefers-color-scheme: dark)")
                          .matches
                          ? Theme.DARK
                          : Theme.LIGHT
                      }
                      allowExpandReactions={false}
                      reactionsDefaultOpen
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onToggleReplyBox(comment.id)}
              className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full transition-all duration-200 transform hover:scale-105"
            >
              <FiMessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Trả lời</span>
            </button>

            {comment.totalChildren > 0 && (
              <button
                onClick={() => onToggleReplies(comment.id)}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                <FiChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isReplyExpanded ? "rotate-180" : ""
                  }`}
                />
                <span className="text-sm font-medium">
                  {comment.totalChildren} phản hồi
                </span>
              </button>
            )}
          </div>

          {/* Reply Box */}
          {renderReplyBox(comment, depth)}

          {/* Replies */}
          {isReplyExpanded && (
            <div className="mt-4 space-y-4">
              {repliesQuery.isFetching && replies.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-6 h-6 animate-spin text-blue-500 dark:text-blue-400" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    Đang tải phản hồi...
                  </span>
                </div>
              ) : (
                <>
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      postId={postId}
                      expandedReplies={expandedReplies}
                      replyStates={replyStates}
                      showEmojiPicker={showEmojiPicker}
                      currentUser={currentUser}
                      onToggleReplies={onToggleReplies}
                      onToggleReplyBox={onToggleReplyBox}
                      onReplyContentChange={onReplyContentChange}
                      onSubmitReply={onSubmitReply}
                      onClearReplyAttachment={onClearReplyAttachment}
                      onReplyFileAttach={onReplyFileAttach}
                      onEmojiSelect={onEmojiSelect}
                      onSetShowEmojiPicker={onSetShowEmojiPicker}
                      createCommentMutation={createCommentMutation}
                      replyFileInputRefs={replyFileInputRefs}
                    />
                  ))}

                  {repliesQuery.hasNextPage && (
                    <div className="flex justify-center mt-4">
                      <LoadingButton
                        loading={repliesQuery.isFetchingNextPage}
                        onClick={() => repliesQuery.fetchNextPage()}
                        variant="secondary"
                        size="sm"
                      >
                        Xem thêm phản hồi
                      </LoadingButton>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Comments: React.FC<{ postId?: number }> = ({ postId = 1 }) => {
  const queryClient = useQueryClient();
  const pageSize = 10;
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Infinite query for main comments
  const {
    data,
    isFetching,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam = 0 }) =>
      fetchComments(
        { page: pageParam, size: pageSize, sort: ["createdAt,desc"] },
        postId
      ),
    getNextPageParam: (lastPage) => {
      const next = lastPage.page.number + 1;
      return next < lastPage.page.totalPages ? next : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  // Helper function để tìm parent comment phù hợp (cấp 1 hoặc 2)
  const findAppropriateParent = (comment: CommentResponse): number => {
    // Nếu comment đang reply là cấp 1 (không có parentId), thì reply sẽ là cấp 2
    if (!comment.parentId) {
      return comment.id;
    }

    // Nếu comment đang reply là cấp 2 (có parentId),
    // thì reply sẽ vẫn thuộc về parent của cấp 2 đó (tức là cấp 1)
    return comment.parentId;
  };

  // Mutation for creating comments/replies
  const createCommentMutation = useMutation({
    mutationFn: (createCommentData: CreateComment) =>
      createComment(createCommentData, postId),
    onSuccess: async (newComment) => {
      if (!newComment.parentId) {
        // Add the new comment to the beginning of the first page
        queryClient.setQueryData(["comments", postId], (oldData: any) => {
          if (!oldData) return oldData;

          const newPages = [...oldData.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              content: [newComment, ...newPages[0].content],
            };
          }

          return {
            ...oldData,
            pages: newPages,
          };
        });
      } else {
        // Add new reply to replies cache
        queryClient.setQueryData(
          ["replies", postId, newComment.parentId],
          (oldData: any) => {
            if (!oldData) return oldData;

            const newPages = [...oldData.pages];
            if (newPages[newPages.length - 1]) {
              // Add to the last page (most recent replies)
              const lastPageIndex = newPages.length - 1;
              newPages[lastPageIndex] = {
                ...newPages[lastPageIndex],
                content: [...newPages[lastPageIndex].content, newComment],
              };
            }

            return {
              ...oldData,
              pages: newPages,
            };
          }
        );

        // Auto-expand replies để hiển thị reply mới
        setExpandedReplies((prev) => new Set(prev).add(newComment.parentId!));

        // Cập nhật totalChildren của parent comment trong cache
        queryClient.setQueryData(["comments", postId], (oldData: any) => {
          if (!oldData) return oldData;

          const updateCommentInPages = (pages: any[]) => {
            return pages.map((page) => ({
              ...page,
              content: page.content.map((comment: CommentResponse) =>
                comment.id === newComment.parentId
                  ? { ...comment, totalChildren: comment.totalChildren + 1 }
                  : comment
              ),
            }));
          };

          return {
            ...oldData,
            pages: updateCommentInPages(oldData.pages),
          };
        });
      }
    },
    onError: (error) => {
      console.error("Failed to create comment/reply:", error);
    },
  });

  // Mutation for creating reactions
  const createReactionMutation = useMutation({
    mutationFn: ({ emoji, commentId }: { emoji: string; commentId: number }) =>
      reactComment(emoji, commentId),
    onSuccess: (newReaction, { commentId }) => {
      updateCommentReactionInCache(commentId, newReaction);
    },
    onError: (error) => {
      console.error("Failed to create reaction:", error);
    },
  });

  // Mutation for updating reactions
  const updateReactionMutation = useMutation({
    mutationFn: ({
      emoji,
      reactionId,
    }: {
      emoji: string;
      reactionId: number;
    }) => updateReaction(emoji, reactionId),
    onSuccess: (updatedReaction, { reactionId }) => {
      // Tìm comment và lấy emoji cũ trước khi cập nhật
      const { commentId, previousEmoji } =
        findCommentAndPreviousEmojiByReactionId(reactionId);
      if (commentId) {
        updateCommentReactionInCache(commentId, updatedReaction, previousEmoji);
      }
    },
    onError: (error) => {
      console.error("Failed to update reaction:", error);
    },
  });

  const findCommentAndPreviousEmojiByReactionId = (
    reactionId: number
  ): { commentId: number | null; previousEmoji?: string } => {
    const allComments = data?.pages.flatMap((page) => page.content) || [];

    // Tìm trong main comments
    for (const comment of allComments) {
      if (comment.userReactionId === reactionId) {
        return {
          commentId: comment.id,
          previousEmoji: comment.userReactionEmoji,
        };
      }
    }

    // Tìm trong replies cache
    const repliesQueries = queryClient.getQueriesData({
      queryKey: ["replies"],
    });

    for (const [key, repliesData] of repliesQueries) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        const replies =
          (repliesData as any).pages?.flatMap((page: any) => page.content) ||
          [];
        for (const reply of replies) {
          if (reply.userReactionId === reactionId) {
            return {
              commentId: reply.id,
              previousEmoji: reply.userReactionEmoji,
            };
          }
        }
      }
    }

    return { commentId: null };
  };

  // Mutation for deleting reactions
  const deleteReactionMutation = useMutation({
    mutationFn: (reactionId: number) => deleteReaction(reactionId),
    onSuccess: (_, reactionId) => {
      // Find the comment that contains this reaction and update cache
      const commentId = findCommentIdByReactionId(reactionId);
      if (commentId) {
        removeReactionFromCache(commentId, reactionId);
      }
    },
    onError: (error) => {
      console.error("Failed to delete reaction:", error);
    },
  });

  // Helper function to find comment ID by reaction ID
  const findCommentIdByReactionId = (reactionId: number): number | null => {
    const allComments = data?.pages.flatMap((page) => page.content) || [];

    for (const comment of allComments) {
      if (comment.userReactionId === reactionId) {
        return comment.id;
      }
    }

    // Also check in replies cache
    const repliesQueries = queryClient.getQueriesData({
      queryKey: ["replies"],
    });
    for (const [key, repliesData] of repliesQueries) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        const replies =
          (repliesData as any).pages?.flatMap((page: any) => page.content) ||
          [];
        for (const reply of replies) {
          if (reply.userReactionId === reactionId) {
            return reply.id;
          }
        }
      }
    }

    return null;
  };

  // Helper function to update comment reaction in cache
  const updateCommentReactionInCache = (
    commentId: number,
    reaction: ReactionResponse,
    previousEmoji?: string
  ) => {
    const updateCommentReaction = (
      comment: CommentResponse
    ): CommentResponse => {
      if (comment.id === commentId) {
        let updatedReactionSummary = [...comment.reactionSummary];

        // Nếu có reaction cũ, loại bỏ nó trước
        if (previousEmoji && comment.hasReacted) {
          updatedReactionSummary = updateReactionSummary(
            updatedReactionSummary,
            previousEmoji,
            "remove"
          );
        }

        // Thêm reaction mới
        updatedReactionSummary = updateReactionSummary(
          updatedReactionSummary,
          reaction.emoji,
          "add"
        );

        return {
          ...comment,
          hasReacted: true,
          userReactionEmoji: reaction.emoji,
          userReactionId: reaction.id,
          reactionSummary: updatedReactionSummary,
        };
      }
      return comment;
    };

    // Update main comments cache
    queryClient.setQueryData(["comments", postId], (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          content: page.content.map(updateCommentReaction),
        })),
      };
    });

    // Update replies cache
    const repliesQueries = queryClient.getQueriesData({
      queryKey: ["replies"],
    });

    for (const [key, repliesData] of repliesQueries) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        queryClient.setQueryData(key, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              content: page.content.map(updateCommentReaction),
            })),
          };
        });
      }
    }
  };

  // Helper function to remove reaction from cache
  const removeReactionFromCache = (commentId: number, reactionId: number) => {
    // Update main comments cache
    queryClient.setQueryData(["comments", postId], (oldData: any) => {
      if (!oldData) return oldData;

      const updateCommentReaction = (
        comment: CommentResponse
      ): CommentResponse => {
        if (comment.id === commentId && comment.userReactionId === reactionId) {
          return {
            ...comment,
            hasReacted: false,
            userReactionEmoji: undefined,
            userReactionId: undefined,
            reactionSummary: updateReactionSummary(
              comment.reactionSummary,
              comment.userReactionEmoji!,
              "remove"
            ),
          };
        }
        return comment;
      };

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          content: page.content.map(updateCommentReaction),
        })),
      };
    });

    // Update replies cache
    const repliesQueries = queryClient.getQueriesData({
      queryKey: ["replies"],
    });
    for (const [key, repliesData] of repliesQueries) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        queryClient.setQueryData(key, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              content: page.content.map((comment: CommentResponse) =>
                comment.id === commentId &&
                comment.userReactionId === reactionId
                  ? {
                      ...comment,
                      hasReacted: false,
                      userReactionEmoji: null,
                      userReactionId: null,
                      reactionSummary: updateReactionSummary(
                        comment.reactionSummary,
                        comment.userReactionEmoji!,
                        "remove"
                      ),
                    }
                  : comment
              ),
            })),
          };
        });
      }
    }
  };

  // Helper function to update reaction summary
  const updateReactionSummary = (
    currentSummary: ReactionSummary[],
    emoji: string,
    action: "add" | "remove"
  ): ReactionSummary[] => {
    const summary = [...currentSummary];
    const existingIndex = summary.findIndex((r) => r.emoji === emoji);

    if (action === "add") {
      if (existingIndex >= 0) {
        summary[existingIndex] = {
          ...summary[existingIndex],
          count: summary[existingIndex].count + 1,
        };
      } else {
        summary.push({ emoji, count: 1 });
      }
    } else if (action === "remove") {
      if (existingIndex >= 0) {
        if (summary[existingIndex].count > 1) {
          summary[existingIndex] = {
            ...summary[existingIndex],
            count: summary[existingIndex].count - 1,
          };
        } else {
          summary.splice(existingIndex, 1);
        }
      }
    }

    return summary;
  };

  // State management
  const [newComment, setNewComment] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const [replyStates, setReplyStates] = useState<
    Record<
      number,
      { isOpen: boolean; content: string; attachedFile: File | null }
    >
  >({});

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRefs = useRef<Record<number, HTMLInputElement | null>>(
    {}
  );

  // Memoized comments data
  const comments = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) || [];
  }, [data]);

  // Event handlers
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleReplyFileAttach = (
    e: React.ChangeEvent<HTMLInputElement>,
    commentId: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          attachedFile: file,
        },
      }));
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearReplyAttachment = (commentId: number) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        attachedFile: null,
      },
    }));
    if (replyFileInputRefs.current[commentId]) {
      replyFileInputRefs.current[commentId]!.value = "";
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() && !attachedFile) return;

    const commentData: CreateComment = {
      content: newComment.trim(),
      attachmentFile: attachedFile ?? undefined,
    };

    try {
      await createCommentMutation.mutateAsync(commentData);
      setNewComment("");
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleSubmitReply = async (comment: CommentResponse) => {
    const replyState = replyStates[comment.id];
    if (!replyState?.content.trim() && !replyState?.attachedFile) return;

    const appropriateParentId = findAppropriateParent(comment);

    const replyData: CreateComment = {
      content: replyState.content.trim(),
      attachmentFile: replyState.attachedFile ?? undefined,
      parentId: appropriateParentId,
    };

    try {
      await createCommentMutation.mutateAsync(replyData);

      // Clear reply state
      setReplyStates((prev) => ({
        ...prev,
        [comment.id]: {
          isOpen: false,
          content: "",
          attachedFile: null,
        },
      }));

      // Clear file input
      if (replyFileInputRefs.current[comment.id]) {
        replyFileInputRefs.current[comment.id]!.value = "";
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);
    }
  };

  const handleEmojiSelect = async (emojiData: any, commentId: number) => {
    setShowEmojiPicker(null);

    // Tìm comment để kiểm tra trạng thái reaction hiện tại
    const allComments = [...comments];
    const repliesQueries = queryClient.getQueriesData({
      queryKey: ["replies"],
    });

    for (const [, repliesData] of repliesQueries) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        const replies =
          (repliesData as any).pages?.flatMap((page: any) => page.content) ||
          [];
        allComments.push(...replies);
      }
    }

    const comment = allComments.find((c) => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.hasReacted) {
        if (comment.userReactionEmoji === emojiData.emoji) {
          // Xóa reaction nếu cùng emoji
          await deleteReactionMutation.mutateAsync(comment.userReactionId!);
        } else {
          // Cập nhật reaction nếu khác emoji
          await updateReactionMutation.mutateAsync({
            emoji: emojiData.emoji,
            reactionId: comment.userReactionId!,
          });
        }
      } else {
        // Tạo reaction mới
        await createReactionMutation.mutateAsync({
          emoji: emojiData.emoji,
          commentId,
        });
      }
    } catch (error) {
      console.error("Failed to handle emoji reaction:", error);
    }
  };

  const toggleReplies = useCallback((commentId: number) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const toggleReplyBox = useCallback((commentId: number) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        isOpen: !prev[commentId]?.isOpen,
        content: prev[commentId]?.content || "",
        attachedFile: prev[commentId]?.attachedFile || null,
      },
    }));
  }, []);

  const handleReplyContentChange = useCallback(
    (commentId: number, content: string) => {
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          content,
        },
      }));
    },
    []
  );

  // Handle click outside emoji picker
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest(".emoji-picker-container")) {
      setShowEmojiPicker(null);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Không thể tải bình luận
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Đã xảy ra lỗi khi tải bình luận. Vui lòng thử lại sau.
          </p>
          <LoadingButton
            loading={false}
            onClick={() => window.location.reload()}
            variant="primary"
            size="md"
          >
            Thử lại
          </LoadingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <h2 className="dark:text-white pl-6 text-xl font-medium">
        Bình luận
      </h2> */}

      {/* Comment Input */}
      <div className="bg-gray-100 mx-6 mt-3 dark:bg-gray-800 rounded-2xl px-4 py-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-start space-x-4">
          <img
            src={
              currentUser?.avatar?.path ||
              `https://ui-avatars.com/api/?name=${currentUser?.firstName}+${currentUser?.lastName}&background=3b82f6&color=ffffff&size=64`
            }
            alt={`avatar`}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
          />
          <div className="flex-1 space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              className="w-full px-4 py-3 resize-none border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              rows={2}
            />

            {attachedFile && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                    {attachedFile.type.startsWith("image") ? (
                      <FiImage className="w-5 h-5 text-white" />
                    ) : (
                      <BiFile className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {attachedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(attachedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearAttachment}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors duration-200"
                >
                  <FiX className="w-5 h-5 text-red-500 dark:text-red-400" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttach}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all duration-200"
                  title="Đính kèm file"
                >
                  <FiPaperclip className="w-5 h-5" />
                </button>
              </div>

              <LoadingButton
                loading={createCommentMutation.isPending}
                onClick={handleSubmitComment}
                disabled={!newComment.trim() && !attachedFile}
                variant="primary"
                size="md"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Đăng bình luận
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isFetching && comments.length === 0 ? (
          // Loading skeletons
          <div className="space-y-6 px-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          // Empty state
          <div className="bg-white m-6 dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Chưa có bình luận nào
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Hãy là người đầu tiên chia sẻ suy nghĩ của bạn về bài viết này!
              </p>
            </div>
          </div>
        ) : (
          // Comments virtualized list
          <div className="space-y-4">
            <Virtuoso
              data={comments}
              endReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              itemContent={(_index, comment) => (
                <div className="pb-4">
                  <CommentItem
                    comment={comment}
                    depth={0}
                    postId={postId}
                    expandedReplies={expandedReplies}
                    replyStates={replyStates}
                    showEmojiPicker={showEmojiPicker}
                    currentUser={currentUser}
                    onToggleReplies={toggleReplies}
                    onToggleReplyBox={toggleReplyBox}
                    onReplyContentChange={handleReplyContentChange}
                    onSubmitReply={handleSubmitReply}
                    onClearReplyAttachment={clearReplyAttachment}
                    onReplyFileAttach={handleReplyFileAttach}
                    onEmojiSelect={handleEmojiSelect}
                    onSetShowEmojiPicker={setShowEmojiPicker}
                    createCommentMutation={createCommentMutation}
                    replyFileInputRefs={replyFileInputRefs}
                  />
                </div>
              )}
              style={{
                minHeight: comments.length < 3 ? "50vh" : "100vh",
              }}
              className="bg-transparent"
            />

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-6">
                <LoadingButton
                  loading={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  variant="secondary"
                  size="lg"
                >
                  <FiChevronDown className="w-4 h-4 mr-2" />
                  Xem thêm bình luận
                </LoadingButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
