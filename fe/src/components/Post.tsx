import AudioFileIcon from "@mui/icons-material/AudioFile";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Attachment,
  Post as PostType,
  ReactionResponse,
  ReactionSummary,
} from "../types";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MdImage,
  MdImageNotSupported,
  MdVideocam,
  MdVideocamOff,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { reactPost } from "../api/post";
import { deleteReaction, updateReaction } from "../api/reaction";
import { RootState } from "../redux/store";
import Comments from "./Comments";

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const heartButtonRef = useRef<HTMLButtonElement>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();

  const LazyImage = React.memo(
    ({
      src,
      alt,
      width,
      className,
      onClick,
      aspectRatio = "16/9",
    }: {
      src: string;
      alt: string;
      className?: string;
      width?: string;
      onClick?: () => void;
      aspectRatio?: string;
    }) => {
      const [isLoaded, setIsLoaded] = useState(false);
      const [hasError, setHasError] = useState(false);
      const imgRef = useRef<HTMLImageElement>(null);

      const handleLoad = useCallback(() => {
        setIsLoaded(true);
      }, []);

      const handleError = useCallback(() => {
        setHasError(true);
        setIsLoaded(true);
      }, []);

      return (
        <div
          className="relative w-full bg-gray-100 dark:bg-gray-700 overflow-hidden"
          style={{ aspectRatio }}
        >
          {/* Skeleton loading */}
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <MdImage
                size={width ? width : 80}
                className="dark:text-gray-100 text-gray-200"
              />
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <MdImageNotSupported
                size={width ? width : 80}
                className="dark:text-gray-100 text-gray-200"
              />
            </div>
          )}

          {/* Actual image */}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${className} ${
              isLoaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300 absolute inset-0 w-full h-full ${width?'object-cover':'object-contain'}`}
            onClick={onClick}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        </div>
      );
    }
  );

  const LazyVideo = React.memo(
    ({
      src,
      type,
      name,
      width,
      aspectRatio = "16/9",
    }: {
      src: string;
      type: string;
      name: string;
      width?: string;
      aspectRatio?: string;
    }) => {
      const [isLoaded, setIsLoaded] = useState(false);
      const [hasError, setHasError] = useState(false);

      return (
        <div
          className="relative w-full bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-lg"
          style={{ aspectRatio }}
        >
          {/* Loading skeleton */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <MdVideocam
                size={width ? width : 80}
                className="dark:text-gray-100 text-gray-200"
              />
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <MdVideocamOff
                size={width ? width : 80}
                className="dark:text-gray-100 text-gray-200"
              />
            </div>
          )}

          {/* Video element */}
          <video
            controls
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            preload="metadata"
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          >
            <source src={src} type={type} />
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>

          {/* Video info overlay */}
          {isLoaded && (
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              <svg
                className="w-3 h-3 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5V12a1.5 1.5 0 01-1.5 1.5H10M15 10h-1.5A1.5 1.5 0 0012 11.5V12a1.5 1.5 0 001.5-1.5H15z"
                />
              </svg>
              {name}
            </div>
          )}
        </div>
      );
    }
  );

  // Mutation for creating new reaction
  const reactPostMutation = useMutation({
    mutationFn: ({ emoji, postId }: { emoji: string; postId: number }) =>
      reactPost(emoji, postId),
    onSuccess: (data: ReactionResponse) => {
      // Update the post in cache
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          content: oldData.content.map((p: PostType) => {
            if (p.id === post.id) {
              const existingReaction = p.reactionSummary.find(
                (r) => r.emoji === data.emoji
              );
              const updatedReactionSummary = existingReaction
                ? p.reactionSummary.map((r) =>
                    r.emoji === data.emoji ? { ...r, count: r.count + 1 } : r
                  )
                : [...p.reactionSummary, { emoji: data.emoji, count: 1 }];

              return {
                ...p,
                hasReacted: true,
                userReactionEmoji: data.emoji,
                userReactionId: data.id,
                reactionSummary: updatedReactionSummary,
              };
            }
            return p;
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast.success("Đã thêm cảm xúc!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
      });
    },
    onError: (error: any) => {
      console.error("Error reacting to post:", error);
      toast.error("Không thể thêm cảm xúc. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2000,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      });
    },
  });

  // Mutation for updating existing reaction
  const updateReactionMutation = useMutation({
    mutationFn: ({
      emoji,
      reactionId,
    }: {
      emoji: string;
      reactionId: number;
    }) => updateReaction(emoji, reactionId),
    onSuccess: (data: ReactionResponse) => {
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          content: oldData.content.map((p: PostType) => {
            if (p.id === post.id) {
              // Decrease count for old emoji
              const oldEmoji = p.userReactionEmoji;
              let updatedReactionSummary = p.reactionSummary
                .map((r) => {
                  if (r.emoji === oldEmoji && r.count > 1) {
                    return { ...r, count: r.count - 1 };
                  }
                  return r;
                })
                .filter((r) => r.count > 0);

              // Increase count for new emoji
              const existingNewReaction = updatedReactionSummary.find(
                (r) => r.emoji === data.emoji
              );
              if (existingNewReaction) {
                updatedReactionSummary = updatedReactionSummary.map((r) =>
                  r.emoji === data.emoji ? { ...r, count: r.count + 1 } : r
                );
              } else {
                updatedReactionSummary.push({ emoji: data.emoji, count: 1 });
              }

              return {
                ...p,
                userReactionEmoji: data.emoji,
                userReactionId: data.id,
                reactionSummary: updatedReactionSummary,
              };
            }
            return p;
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Đã cập nhật cảm xúc!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
      });
    },
    onError: (error: any) => {
      console.error("Error updating reaction:", error);
      toast.error("Không thể cập nhật cảm xúc. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2000,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      });
    },
  });

  // Mutation for deleting reaction
  const deleteReactionMutation = useMutation({
    mutationFn: (reactionId: number) => deleteReaction(reactionId),
    onSuccess: () => {
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          content: oldData.content.map((p: PostType) => {
            if (p.id === post.id) {
              const oldEmoji = p.userReactionEmoji;
              const updatedReactionSummary = p.reactionSummary
                .map((r) => {
                  if (r.emoji === oldEmoji && r.count > 1) {
                    return { ...r, count: r.count - 1 };
                  }
                  return r;
                })
                .filter((r) => r.count > 0);

              return {
                ...p,
                hasReacted: false,
                userReactionEmoji: undefined,
                userReactionId: undefined,
                reactionSummary: updatedReactionSummary,
              };
            }
            return p;
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Đã xóa cảm xúc!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting reaction:", error);
      toast.error("Không thể xóa cảm xúc. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2000,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      });
    },
  });

  // Check if any mutation is loading
  const isReactionLoading =
    reactPostMutation.isPending ||
    updateReactionMutation.isPending ||
    deleteReactionMutation.isPending;

  // Handle emoji click from picker
  const handleEmojiClick = async (emojiData: EmojiClickData) => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này!", {
        position: "top-right",
        autoClose: 2000,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      });
      return;
    }

    const selectedEmoji = emojiData.emoji;
    setShowEmojiPicker(false);

    // If user has already reacted
    if (post.hasReacted && post.userReactionId) {
      // If clicking the same emoji, delete the reaction
      if (post.userReactionEmoji === selectedEmoji) {
        deleteReactionMutation.mutate(post.userReactionId);
      } else {
        // Update to new emoji
        updateReactionMutation.mutate({
          emoji: selectedEmoji,
          reactionId: post.userReactionId,
        });
      }
    } else {
      // Create new reaction
      reactPostMutation.mutate({
        emoji: selectedEmoji,
        postId: post.id,
      });
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        heartButtonRef.current &&
        !heartButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleHeartButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này!", {
        position: "top-right",
        autoClose: 2000,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      });
      return;
    }

    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    } else {
      setShowEmojiPicker(true);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có, xóa bài viết!",
      cancelButtonText: "Không, giữ lại",
      reverseButtons: true,
      confirmButtonColor: "#d33",
      focusCancel: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Đang xóa...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      try {
        await Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Bài viết của bạn đã được xóa.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        await Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Có lỗi xảy ra!",
        });
      } finally {
        setMenuOpen(false);
      }
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Đã sao chép liên kết bài viết!", {
        closeOnClick: true,
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
      });
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();

    if (type.includes("image")) return <ImageIcon className="w-5 h-5" />;
    if (type.includes("video")) return <VideoFileIcon className="w-5 h-5" />;
    if (type.includes("audio")) return <AudioFileIcon className="w-5 h-5" />;
    if (type.includes("pdf")) return <PictureAsPdfIcon className="w-5 h-5" />;
    if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
      return <FolderZipIcon className="w-5 h-5" />;
    if (type.includes("word") || type.includes("doc"))
      return <DescriptionIcon className="w-5 h-5" />;
    if (type.includes("text") || type.includes("txt"))
      return <DescriptionIcon className="w-5 h-5" />;

    return <InsertDriveFileIcon className="w-5 h-5" />;
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement("a");
    link.href = attachment.file.path;
    link.download = attachment.file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImageFile = (fileType: string) =>
    fileType.toLowerCase().includes("image");
  const isVideoFile = (fileType: string) =>
    fileType.toLowerCase().includes("video");
  const isAudioFile = (fileType: string) =>
    fileType.toLowerCase().includes("audio");

  const groupAttachmentsByType = () => {
    const images = post.attachments.filter((att) => isImageFile(att.file.type));
    const videos = post.attachments.filter((att) => isVideoFile(att.file.type));
    const audios = post.attachments.filter((att) => isAudioFile(att.file.type));
    const others = post.attachments.filter(
      (att) =>
        !isImageFile(att.file.type) &&
        !isVideoFile(att.file.type) &&
        !isAudioFile(att.file.type)
    );

    return { images, videos, audios, others };
  };

  const renderImageGallery = (
    images: Attachment[],
    selectedImageIndex: number,
    setSelectedImageIndex: (index: number) => void
  ) => {
    if (images.length === 0) return null;

    return (
      <div className="mb-4 -mx-4 sm:-mx-6">
        {images.length === 1 ? (
          <LazyImage
            src={images[0].file.path}
            alt={images[0].file.name}
            className="cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(images[0].file.path, "_blank")}
            aspectRatio="auto"
          />
        ) : (
          <div className="space-y-3">
            {/* Main image với fixed aspect ratio */}
            <div className="relative">
              <LazyImage
                src={images[selectedImageIndex].file.path}
                alt={images[selectedImageIndex].file.name}
                className="cursor-pointer hover:opacity-95 transition-opacity rounded-lg"
                onClick={() =>
                  window.open(images[selectedImageIndex].file.path, "_blank")
                }
                aspectRatio="16/10"
              />

              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails with fixed size */}
            <div className="flex justify-center gap-2 px-4 sm:px-6 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex
                      ? "border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <LazyImage
                    src={image.file.path}
                    alt={`Hình thu nhỏ ${index + 1}`}
                    width="20"
                    aspectRatio="1/1"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVideoPlayer = (videos: Attachment[]) => {
    if (videos.length === 0) return null;

    return (
      <div className="mb-4 -mx-4 sm:-mx-6 space-y-4">
        {videos.map((video) => (
          <LazyVideo
            key={video.id}
            src={video.file.path}
            type={video.file.type}
            name={video.file.name}
            width="20"
            aspectRatio="16/9"
          />
        ))}
      </div>
    );
  };

  const renderAudioPlayer = (audios: Attachment[]) => {
    if (audios.length === 0) return null;

    return (
      <div className="mb-4 space-y-3">
        {audios.map((audio) => (
          <div
            key={audio.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <AudioFileIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {audio.file.name}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {formatFileSize(audio.file.size)}
              </span>
            </div>
            <audio controls className="w-full">
              <source src={audio.file.path} type={audio.file.type} />
              Trình duyệt của bạn không hỗ trợ phần tử audio.
            </audio>
          </div>
        ))}
      </div>
    );
  };

  const renderOtherFiles = (others: Attachment[]) => {
    if (others.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {others.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => handleDownload(attachment)}
            >
              <div className="text-gray-500 dark:text-gray-400">
                {getFileIcon(attachment.file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {attachment.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(attachment.file.size)}
                </p>
              </div>
              <DownloadIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const { images, videos, audios, others } = groupAttachmentsByType();

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

  const renderReactionSummary = () => {
    const { topReactions, otherCount, totalCount } = processReactionSummary(
      post.reactionSummary
    );

    if (totalCount === 0) return null;

    return (
      <div className="flex items-center space-x-2 mt-3">
        <div className="flex items-center space-x-1">
          {topReactions.map((reaction, idx) => {
            const isUserReaction =
              post.hasReacted && post.userReactionEmoji === reaction.emoji;

            return (
              <button
                key={`${reaction.emoji}-${idx}`}
                className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-200 border transform hover:scale-105 active:scale-95 ${
                  isUserReaction
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-md"
                    : "bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm"
                }`}
                title={`${reaction.emoji} ${reaction.count}${
                  isUserReaction ? " (Bạn đã phản ứng)" : ""
                }`}
                onClick={() =>
                  handleEmojiClick({ emoji: reaction.emoji } as EmojiClickData)
                }
                disabled={isReactionLoading}
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
              title={`${otherCount > 10 ? "+10" : otherCount} cảm xúc khác`}
            >
              <span className="text-sm">⋯</span>
              <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                {otherCount}
              </span>
            </button>
          )}
        </div>

        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {totalCount > 15 ? "+15" : totalCount} lượt cảm xúc
        </span>
      </div>
    );
  };

  return (
    <div className="group mb-4 sm:mb-6 lg:mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="relative">
                <img
                  src={
                    post.creator?.avatar?.path ||
                    `https://ui-avatars.com/api/?name=${post.creator?.firstName}+${post.creator?.lastName}&background=3b82f6&color=ffffff&size=64`
                  }
                  alt={`avatar`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition-all duration-200"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <Link
                  to={`/profile/${post.creator.id}`}
                  className="no-underline group/link"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors duration-200 text-sm sm:text-base truncate">
                    {post.creator.firstName} {post.creator.lastName}
                  </span>
                </Link>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>
            </div>

            {/* Menu Button */}
            <div className="relative flex-shrink-0">
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Tùy chọn bài viết"
              >
                <MoreHorizIcon className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && post.creator.id === currentUser?.id && (
                <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-36">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={handleDelete}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa bài viết
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="mt-4">
            {post.content && (
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-base">
                {post.content}
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="px-4 sm:px-6">
          {renderImageGallery(
            images,
            selectedImageIndex,
            setSelectedImageIndex
          )}
          {renderVideoPlayer(videos)}
          {renderAudioPlayer(audios)}
          {renderOtherFiles(others)}
        </div>

        {/* Reaction Summary */}
        <div className="px-4 sm:px-6">{renderReactionSummary()}</div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Heart/Reaction Button */}
              <div className="relative">
                <button
                  ref={heartButtonRef}
                  className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    post.hasReacted
                      ? " text-white shadow-md"
                      : "bg-gray-50 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 dark:hover:from-pink-900/20 dark:hover:to-red-900/20 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
                  } border border-gray-200 dark:border-gray-600 hover:text-pink-300 hover:border-pink-300 dark:hover:border-pink-600`}
                  onClick={handleHeartButtonClick}
                  disabled={isReactionLoading}
                  aria-label={post.hasReacted ? "Bỏ thích" : "Thích"}
                >
                  {post.hasReacted && post.userReactionEmoji ? (
                    <span className="text-lg">{post.userReactionEmoji}</span>
                  ) : (
                    <FavoriteBorderOutlinedIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">
                    {post.hasReacted ? "Đã thích" : "Thích"}
                  </span>
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl rounded-full overflow-hidden border border-gray-200 dark:border-gray-600"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
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
                )}
              </div>

              {/* Comment Button */}
              <button
                className="group group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95"
                onClick={() => setCommentOpen(!commentOpen)}
                aria-label="Bình luận"
              >
                <TextsmsOutlinedIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                <span className="text-xs sm:text-sm font-medium">
                  Bình luận
                </span>
                {post.totalComments > 0 && (
                  <span className="bg-blue-100 border border-transparent group-hover:border-blue-600   dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full transition-all font-semibold">
                    {post.totalComments}
                  </span>
                )}
              </button>
            </div>

            {/* Share Button */}
            <button
              className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 transform hover:scale-105 active:scale-95"
              onClick={handleShare}
              aria-label="Chia sẻ"
            >
              <ShareOutlinedIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
              <span className="text-xs sm:text-sm font-medium">Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {commentOpen && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            <div className="p-4 sm:p-6">
              <Comments postId={post.id} />
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Post;
