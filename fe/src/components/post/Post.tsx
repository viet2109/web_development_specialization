import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import {
  deletePost,
  heartPost,
  resetError,
  unheartPost,
} from "../../redux/postSlice";
import { Post as PostType } from "../../types";
import Comments from "../comments/Comments";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const { hearts, isLoading, error } = useAppSelector((state) => state.posts);

  const postHearts = hearts[post.id] || post.reactionSummary || [];
  const hasHearted = currentUser?.id
    ? postHearts.includes(currentUser.id)
    : false;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(resetError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleHeart = async () => {
    if (!currentUser?.id || !token) {
      return;
    }

    try {
      if (hasHearted) {
        console.log("Calling unheartPost for postId:", post.id);
        await dispatch(
          unheartPost({ postId: post.id, userId: currentUser.id })
        ).unwrap();
      } else {
        console.log("Calling heartPost for postId:", post.id);
        await dispatch(
          heartPost({ postId: post.id, userId: currentUser.id })
        ).unwrap();
      }
    } catch (err) {
      console.error("Error handling heart/unheart:", err);
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.id || !token) return;

    if (window.confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      try {
        await dispatch(deletePost(post.id)).unwrap();
      } catch (error) {
        console.error("Error deleting post:", error);
      } finally {
        setIsDeleting(false);
        setMenuOpen(false);
      }
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareMessage("Link copied to clipboard!");
      setTimeout(() => setShareMessage(""), 3000);
    });
  };

  const handleResetError = () => {
    dispatch(resetError());
  };

  return (
    <div className="group mb-4 sm:mb-6 lg:mb-8">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out hover:scale-[1.01] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="relative">
                <img
                  src={post.creator.avatar?.path || "/default-avatar.png"}
                  alt={`${post.creator.firstName}'s profile`}
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
                aria-label="Post options"
              >
                <MoreHorizIcon className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && post.creator.id === currentUser?.id && (
                <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl py-2 px-1 z-20 min-w-[120px] border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 text-sm font-medium"
                    aria-label="Delete post"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-4">
          <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed mb-4">
            {post.content}
          </p>

          {/* Image Attachment */}
          {post.attachments.length > 0 && (
            <div className="mb-4 -mx-4 sm:-mx-6">
              <img
                src={post.attachments[0].file.path}
                alt="Post content"
                className="w-full max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 animate-in slide-in-from-top-2">
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </span>
              <button
                onClick={handleResetError}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium ml-3 flex-shrink-0"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Heart Button */}
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group/heart"
                onClick={handleHeart}
                disabled={isLoading || !currentUser?.id}
                aria-label={hasHearted ? "Unheart post" : "Heart post"}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                ) : hasHearted ? (
                  <FavoriteOutlinedIcon className="w-5 h-5 text-red-500 group-hover/heart:scale-110 transition-transform duration-200" />
                ) : (
                  <FavoriteBorderOutlinedIcon className="w-5 h-5 text-gray-500 group-hover/heart:text-red-500 group-hover/heart:scale-110 transition-all duration-200" />
                )}
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/heart:text-red-500 transition-colors duration-200">
                  {postHearts.length}
                </span>
              </button>

              {/* Comment Button */}
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group/comment"
                onClick={() => setCommentOpen(!commentOpen)}
                aria-label="View comments"
              >
                <TextsmsOutlinedIcon className="w-5 h-5 text-gray-500 group-hover/comment:text-blue-500 group-hover/comment:scale-110 transition-all duration-200" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/comment:text-blue-500 transition-colors duration-200">
                  {post.totalComments}
                </span>
              </button>

              {/* Share Button */}
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group/share relative"
                onClick={handleShare}
                aria-label="Share post"
              >
                <ShareOutlinedIcon className="w-5 h-5 text-gray-500 group-hover/share:text-green-500 group-hover/share:scale-110 transition-all duration-200" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/share:text-green-500 transition-colors duration-200 hidden sm:inline">
                  Share
                </span>

                {/* Share Message Tooltip */}
                {shareMessage && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap animate-in slide-in-from-bottom-2 duration-200">
                    {shareMessage}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {commentOpen && (
          <div className="border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4 duration-300">
            <Comments postId={post.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
