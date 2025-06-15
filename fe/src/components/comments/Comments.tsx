import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import EmojiPicker from "emoji-picker-react";
import React, { useCallback, useRef, useState } from "react";
import { BiFile } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import {
  FiChevronDown,
  FiImage,
  FiMessageCircle,
  FiPaperclip,
  FiSend,
  FiSmile,
  FiX,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { Virtuoso } from "react-virtuoso";
import { createComment, fetchComments, reactComment } from "../../api/comment";
import { deleteReaction, updateReaction } from "../../api/reaction";
import { RootState } from "../../redux/store";
import {
  CommentResponse,
  CreateComment,
  ReactionResponse,
  ReactionSummary,
} from "../../types";

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

  // Hook để quản lý infinite queries cho replies của từng comment
  const useRepliesInfiniteQuery = (commentId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ["replies", postId, commentId],
      queryFn: ({ pageParam = 0 }) =>
        fetchComments(
          {
            page: pageParam,
            size: pageSize,
            parentId: commentId,
            sort: ["createdAt,desc"],
          },
          postId
        ),
      getNextPageParam: (lastPage) => {
        const next = lastPage.page.number + 1;
        return next < lastPage.page.totalPages ? next : undefined;
      },
      initialPageParam: 0,
      enabled,
      staleTime: 1000 * 60 * 5,
    });
  };

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

  // Helper function để xác định depth của comment
  const getCommentDepth = (comment: CommentResponse): number => {
    return comment.parentId ? 2 : 1; // Chỉ có 2 cấp: 1 (root) và 2 (reply)
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
      // Find the comment that contains this reaction and update cache
      const commentId = findCommentIdByReactionId(reactionId);
      if (commentId) {
        updateCommentReactionInCache(commentId, updatedReaction);
      }
    },
    onError: (error) => {
      console.error("Failed to update reaction:", error);
    },
  });

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

    // Search in main comments
    for (const comment of allComments) {
      if (comment.userReactionId === reactionId) {
        return comment.id;
      }
    }

    // Search in replies cache
    const repliesQueryData = queryClient.getQueriesData({
      queryKey: ["replies", postId],
    });

    for (const [_, repliesData] of repliesQueryData) {
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
    reaction: ReactionResponse
  ) => {
    const updateCommentInData = (comment: CommentResponse): CommentResponse => {
      if (comment.id === commentId) {
        // Update reaction summary
        const existingReactionIndex = comment.reactionSummary.findIndex(
          (r) => r.emoji === reaction.emoji
        );

        let newReactionSummary = [...comment.reactionSummary];

        if (existingReactionIndex >= 0) {
          // If user previously had a different reaction, decrease old count
          if (
            comment.hasReacted &&
            comment.userReactionEmoji !== reaction.emoji
          ) {
            const oldReactionIndex = newReactionSummary.findIndex(
              (r) => r.emoji === comment.userReactionEmoji
            );
            if (oldReactionIndex >= 0) {
              if (newReactionSummary[oldReactionIndex].count <= 1) {
                newReactionSummary.splice(oldReactionIndex, 1);
              } else {
                newReactionSummary[oldReactionIndex].count -= 1;
              }
            }
          }

          // Update or increment new reaction
          if (!comment.hasReacted) {
            newReactionSummary[existingReactionIndex].count += 1;
          }
        } else {
          // Add new reaction type
          if (!comment.hasReacted) {
            newReactionSummary.push({ emoji: reaction.emoji, count: 1 });
          } else {
            // Remove old reaction and add new one
            const oldReactionIndex = newReactionSummary.findIndex(
              (r) => r.emoji === comment.userReactionEmoji
            );
            if (oldReactionIndex >= 0) {
              if (newReactionSummary[oldReactionIndex].count <= 1) {
                newReactionSummary.splice(oldReactionIndex, 1);
              } else {
                newReactionSummary[oldReactionIndex].count -= 1;
              }
            }
            newReactionSummary.push({ emoji: reaction.emoji, count: 1 });
          }
        }

        return {
          ...comment,
          reactionSummary: newReactionSummary,
          hasReacted: true,
          userReactionEmoji: reaction.emoji,
          userReactionId: reaction.id, // Store the reaction ID
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
          content: page.content.map(updateCommentInData),
        })),
      };
    });

    // Update replies cache - need to check all replies queries
    const repliesQueryData = queryClient.getQueriesData({
      queryKey: ["replies", postId],
    });

    for (const [queryKey, repliesData] of repliesQueryData) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        queryClient.setQueryData(queryKey, {
          ...repliesData,
          pages: (repliesData as any).pages.map((page: any) => ({
            ...page,
            content: page.content.map(updateCommentInData),
          })),
        });
      }
    }
  };

  // Helper function to remove reaction from cache
  const removeReactionFromCache = (commentId: number, reactionId: number) => {
    const updateCommentInData = (comment: CommentResponse): CommentResponse => {
      if (
        comment.id === commentId &&
        comment.hasReacted &&
        comment.userReactionId === reactionId
      ) {
        const newReactionSummary = comment.reactionSummary
          .map((reaction) => {
            if (reaction.emoji === comment.userReactionEmoji) {
              return { ...reaction, count: reaction.count - 1 };
            }
            return reaction;
          })
          .filter((reaction) => reaction.count > 0);

        return {
          ...comment,
          reactionSummary: newReactionSummary,
          hasReacted: false,
          userReactionEmoji: undefined,
          userReactionId: undefined,
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
          content: page.content.map(updateCommentInData),
        })),
      };
    });

    // Update replies cache - need to check all replies queries
    const repliesQueryData = queryClient.getQueriesData({
      queryKey: ["replies", postId],
    });

    for (const [queryKey, repliesData] of repliesQueryData) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        queryClient.setQueryData(queryKey, {
          ...repliesData,
          pages: (repliesData as any).pages.map((page: any) => ({
            ...page,
            content: page.content.map(updateCommentInData),
          })),
        });
      }
    }
  };

  // Flatten all comments from pages
  const comments = data?.pages.flatMap((page) => page.content) || [];

  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const [newComment, setNewComment] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);

  // Reply states for individual comments
  const [replyStates, setReplyStates] = useState<
    Record<
      number,
      {
        isOpen: boolean;
        content: string;
        attachedFile: File | null;
      }
    >
  >({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRefs = useRef<Record<number, HTMLInputElement | null>>(
    {}
  );

  // Function to process reaction summary for display
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

  const handleSubmitComment = async () => {
    if (!newComment.trim() && !attachedFile) return;

    const createCommentData: CreateComment = {
      content: newComment,
      attachmentFile: attachedFile || undefined,
    };

    try {
      await createCommentMutation.mutateAsync(createCommentData);
      setNewComment("");
      setAttachedFile(null);
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
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

  const toggleReplyBox = (commentId: number) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        isOpen: !prev[commentId]?.isOpen,
        content: prev[commentId]?.content || "",
        attachedFile: prev[commentId]?.attachedFile || null,
      },
    }));
  };

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

  const handleSubmitReply = async (comment: CommentResponse) => {
    const replyState = replyStates[comment.id];
    if (!replyState?.content.trim() && !replyState?.attachedFile) return;

    // Tìm parentId phù hợp (luôn là cấp 1 để giới hạn chỉ 2 cấp)
    const appropriateParentId = findAppropriateParent(comment);

    const createReplyData: CreateComment = {
      content: replyState.content,
      parentId: appropriateParentId,
      attachmentFile: replyState.attachedFile || undefined,
    };

    try {
      await createCommentMutation.mutateAsync(createReplyData);

      // Clear reply state
      setReplyStates((prev) => ({
        ...prev,
        [comment.id]: {
          isOpen: false,
          content: "",
          attachedFile: null,
        },
      }));
    } catch (error) {
      console.error("Error creating reply:", error);
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
  };

  const toggleReplies = (commentId: number) => {
    if (expandedReplies.has(commentId)) {
      const next = new Set(expandedReplies);
      next.delete(commentId);
      setExpandedReplies(next);
    } else {
      setExpandedReplies((prev) => new Set(prev).add(commentId));
    }
  };

  const handleEmojiSelect = (emojiData: any, commentId: number) => {
    const emoji = emojiData.emoji;
    const comment = findCommentById(commentId);

    if (!comment) return;

    if (comment.hasReacted) {
      if (comment.userReactionEmoji === emoji) {
        // User is removing their reaction
        if (comment.userReactionId) {
          deleteReactionMutation.mutate(comment.userReactionId);
        }
      } else {
        // User is changing their reaction
        if (comment.userReactionId) {
          updateReactionMutation.mutate({
            emoji,
            reactionId: comment.userReactionId,
          });
        }
      }
    } else {
      // User is adding a new reaction
      createReactionMutation.mutate({ emoji, commentId });
    }

    setShowEmojiPicker(null);
  };

  // Helper function to find comment by ID
  const findCommentById = (commentId: number): CommentResponse | null => {
    const allComments = data?.pages.flatMap((page) => page.content) || [];

    // Search in main comments
    const mainComment = allComments.find((comment) => comment.id === commentId);
    if (mainComment) return mainComment;

    // Search in replies cache
    const repliesQueryData = queryClient.getQueriesData({
      queryKey: ["replies", postId],
    });

    for (const [_, repliesData] of repliesQueryData) {
      if (
        repliesData &&
        typeof repliesData === "object" &&
        "pages" in repliesData
      ) {
        const replies =
          (repliesData as any).pages?.flatMap((page: any) => page.content) ||
          [];
        const replyComment = replies.find(
          (reply: CommentResponse) => reply.id === commentId
        );
        if (replyComment) return replyComment;
      }
    }

    return null;
  };

  const renderAttachment = (attachment?: CommentResponse["attachment"]) => {
    if (!attachment) return null;
    const { file } = attachment;

    const isImage = file.type.startsWith("image/");
    return (
      <div className="mt-2 rounded-lg overflow-hidden">
        {isImage ? (
          <img
            src={file.path}
            alt={file.name}
            className="max-w-full h-auto max-h-64 object-cover"
          />
        ) : (
          <div className="flex items-center p-3 bg-gray-50">
            <BiFile className="w-8 h-8 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-gray-500">
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
    depth: number,
    comment: CommentResponse
  ) => {
    const { topReactions, otherCount, totalCount } =
      processReactionSummary(reactions);

    if (totalCount === 0) return null;

    return (
      <div className="flex items-center space-x-1 mt-2 ml-2">
        <div className="flex items-center space-x-1">
          {topReactions.map((reaction, idx) => {
            const isUserReaction =
              comment.hasReacted &&
              comment.userReactionEmoji === reaction.emoji;

            return (
              <button
                key={`${reaction.emoji}-${idx}`}
                onClick={() =>
                  handleEmojiSelect({ emoji: reaction.emoji }, comment.id)
                }
                className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors border bg-blue-50 hover:bg-blue-100 border-blue-200 ${
                  depth > 1 ? "text-xs" : "text-xs"
                }`}
                title={`${reaction.emoji} ${reaction.count}${
                  isUserReaction ? " (Bạn đã thích)" : ""
                }`}
              >
                <span className="text-sm">{reaction.emoji}</span>
                <span
                  className={`font-medium text-xs ${
                    isUserReaction ? "text-blue-700" : "text-blue-600"
                  }`}
                >
                  {reaction.count}
                </span>
              </button>
            );
          })}

          {otherCount > 0 && (
            <button
              className={`flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors border border-gray-300 ${
                depth > 1 ? "text-xs" : "text-xs"
              }`}
              title={`${otherCount} phản ứng khác`}
            >
              <span className="text-sm">...</span>
              <span className="text-gray-600 font-medium text-xs">
                {otherCount}
              </span>
            </button>
          )}
        </div>

        {totalCount > 0 && (
          <span
            className={`text-gray-500 ml-2 ${
              depth > 1 ? "text-xs" : "text-xs"
            }`}
          >
            {totalCount} lượt cảm xúc
          </span>
        )}
      </div>
    );
  };

  const renderReplyBox = (comment: CommentResponse, depth: number) => {
    const replyState = replyStates[comment.id];
    if (!replyState?.isOpen) return null;

    return (
      <div
        className={`mt-3 ${
          depth > 1 ? "ml-8" : "ml-13"
        } bg-gray-50 rounded-lg p-3 border border-gray-200`}
      >
        <div className="flex items-start space-x-3">
          {currentUser?.avatar?.path ? (
            <img
              src={currentUser.avatar.path}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-blue-100 dark:ring-blue-900 flex items-center justify-center">
              <FaUser className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <textarea
              value={replyState.content}
              onChange={(e) =>
                handleReplyContentChange(comment.id, e.target.value)
              }
              placeholder={`Trả lời ${comment.creator.firstName}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={2}
            />

            {replyState.attachedFile && (
              <div className="p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {replyState.attachedFile.type.startsWith("image/") ? (
                    <FiImage className="w-4 h-4 text-gray-400" />
                  ) : (
                    <BiFile className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-700">
                    {replyState.attachedFile.name}
                  </span>
                </div>
                <button
                  onClick={() => clearReplyAttachment(comment.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  ref={(el) => {
                    if (el) replyFileInputRefs.current[comment.id] = el;
                  }}
                  type="file"
                  onChange={(e) => handleReplyFileAttach(e, comment.id)}
                  className="hidden"
                />
                <button
                  onClick={() =>
                    replyFileInputRefs.current[comment.id]?.click()
                  }
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FiPaperclip className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleReplyBox(comment.id)}
                  className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSubmitReply(comment)}
                  disabled={
                    (!replyState.content.trim() && !replyState.attachedFile) ||
                    createCommentMutation.isPending
                  }
                  className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-1 text-sm"
                >
                  {createCommentMutation.isPending ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend className="w-3 h-3" />
                  )}
                  <span>Gửi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component để render replies với infinite scrolling
  const RepliesSection: React.FC<{
    parentComment: CommentResponse;
    depth: number;
    isExpanded: boolean;
  }> = ({ parentComment, depth, isExpanded }) => {
    const {
      data: repliesData,
      isFetching: isRepliesFetching,
      hasNextPage: hasNextRepliesPage,
      isFetchingNextPage: isFetchingNextRepliesPage,
      fetchNextPage: fetchNextRepliesPage,
    } = useRepliesInfiniteQuery(parentComment.id, isExpanded);

    const replies = repliesData?.pages.flatMap((page) => page.content) || [];

    if (!isExpanded) return null;

    return (
      <div className={`mt-3 ${depth > 1 ? "ml-8" : "ml-13"}`}>
        {isRepliesFetching && replies.length === 0 ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {replies.map((reply) => (
              <div key={reply.id} className="mb-4">
                {renderComment(reply, depth + 1)}
              </div>
            ))}

            {hasNextRepliesPage && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => fetchNextRepliesPage()}
                  disabled={isFetchingNextRepliesPage}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isFetchingNextRepliesPage ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
                  <span>
                    {isFetchingNextRepliesPage
                      ? "Đang tải..."
                      : "Xem thêm phản hồi"}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderComment = (comment: CommentResponse, depth: number = 1) => {
    const isExpanded = expandedReplies.has(comment.id);
    const hasReplies = comment.totalChildren > 0;

    return (
      <div className="relative">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          {comment.creator.avatar?.path ? (
            <img
              src={comment.creator.avatar.path}
              alt={`${comment.creator.firstName} ${comment.creator.lastName}`}
              className={`${
                depth > 1 ? "w-8 h-8" : "w-10 h-10"
              } rounded-full object-cover ring-2 ring-blue-100`}
            />
          ) : (
            <div
              className={`${
                depth > 1 ? "w-8 h-8" : "w-10 h-10"
              } rounded-full bg-gray-300 ring-2 ring-blue-100 flex items-center justify-center`}
            >
              <FaUser
                className={`${depth > 1 ? "w-4 h-4" : "w-5 h-5"} text-gray-600`}
              />
            </div>
          )}

          {/* Comment content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex items-center space-x-2 mb-1">
                <h4
                  className={`font-semibold text-gray-900 ${
                    depth > 1 ? "text-sm" : "text-base"
                  }`}
                >
                  {comment.creator.firstName} {comment.creator.lastName}
                </h4>
                <span
                  className={`text-gray-500 ${
                    depth > 1 ? "text-xs" : "text-sm"
                  }`}
                  title={new Date(comment.createdAt).toLocaleString("vi-VN")}
                >
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>

              <p
                className={`text-gray-800 ${
                  depth > 1 ? "text-sm" : "text-base"
                } whitespace-pre-wrap`}
              >
                {comment.content}
              </p>

              {renderAttachment(comment.attachment)}
            </div>

            {/* Reaction summary */}
            {renderReactionSummary(comment.reactionSummary, depth, comment)}

            {/* Action buttons */}
            <div className="flex items-center space-x-4 mt-2 ml-2">
              <div className="relative">
                <button
                  onClick={() =>
                    setShowEmojiPicker(
                      showEmojiPicker === comment.id ? null : comment.id
                    )
                  }
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${
                    comment.hasReacted
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  } ${depth > 1 ? "text-xs" : "text-sm"}`}
                >
                  <FiSmile className="w-4 h-4" />
                  <span>Thích</span>
                </button>

                {showEmojiPicker === comment.id && (
                  <div className="absolute top-full left-0 z-50 mt-1">
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        handleEmojiSelect(emojiData, comment.id)
                      }
                      width={300}
                      height={400}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => toggleReplyBox(comment.id)}
                className={`flex items-center space-x-1 px-2 py-1 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100 transition-colors ${
                  depth > 1 ? "text-xs" : "text-sm"
                }`}
              >
                <FiMessageCircle className="w-4 h-4" />
                <span>Trả lời</span>
              </button>

              {hasReplies && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className={`flex items-center space-x-1 px-2 py-1 text-blue-600 rounded-full hover:text-blue-800 hover:bg-blue-50 transition-colors ${
                    depth > 1 ? "text-xs" : "text-sm"
                  }`}
                >
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                  <span>
                    {isExpanded ? "Ẩn" : "Xem"} {comment.totalChildren} phản hồi
                  </span>
                </button>
              )}
            </div>

            {/* Reply box */}
            {renderReplyBox(comment, depth)}

            {/* Replies section */}
            <RepliesSection
              parentComment={comment}
              depth={depth}
              isExpanded={isExpanded}
            />
          </div>
        </div>
      </div>
    );
  };

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Có lỗi xảy ra khi tải bình luận. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Bình luận ({data?.pages[0]?.page.totalElements || 0})
      </h2>

      {/* Comment input */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          {currentUser?.avatar?.path ? (
            <img
              src={currentUser.avatar.path}
              alt="Your avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 ring-2 ring-blue-100 flex items-center justify-center">
              <FaUser className="w-5 h-5 text-gray-600" />
            </div>
          )}

          <div className="flex-1 space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />

            {attachedFile && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {attachedFile.type.startsWith("image/") ? (
                    <FiImage className="w-5 h-5 text-gray-400" />
                  ) : (
                    <BiFile className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">
                    {attachedFile.name}
                  </span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileAttach}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiPaperclip className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSubmitComment}
                disabled={
                  (!newComment.trim() && !attachedFile) ||
                  createCommentMutation.isPending
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {createCommentMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
                <span>Đăng</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {isFetching && comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Đang tải bình luận...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiMessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <Virtuoso
            style={{ height: "600px" }}
            data={comments}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            itemContent={(index, comment) => (
              <div className="pb-6">{renderComment(comment)}</div>
            )}
            components={{
              Footer: () => {
                if (isFetchingNextPage) {
                  return (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">
                        Đang tải thêm bình luận...
                      </p>
                    </div>
                  );
                }
                if (!hasNextPage && comments.length > 0) {
                  return (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Đã hiển thị tất cả bình luận
                    </div>
                  );
                }
                return null;
              },
            }}
          />
        )}
      </div>

      {/* Click outside to close emoji picker */}
      {showEmojiPicker !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmojiPicker(null)}
        />
      )}
    </div>
  );
};

export default Comments;
