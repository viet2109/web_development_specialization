import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import Comments from "../comments/Comments";
import { deletePost, heartPost, resetError, unheartPost } from "../../redux/postSlice";

interface Post {
  id: number;
  userId: number;
  name: string;
  profilePic: string;
  desc: string;
  img?: string;
  createdAt: string;
  reactionSummary: number[];
  totalComments: number;
}

interface PostProps {
  post: Post;
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
  const hasHearted = currentUser?.id ? postHearts.includes(currentUser.id) : false;

  

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
        await dispatch(unheartPost({ postId: post.id, userId: currentUser.id })).unwrap();
      } else {
        console.log("Calling heartPost for postId:", post.id);
        await dispatch(heartPost({ postId: post.id, userId: currentUser.id })).unwrap();
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
    <div className="rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-xl transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <img
              src={post.profilePic}
              alt={`${post.name}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <Link to={`/profile/${post.userId}`} className="no-underline text-inherit">
                <span className="font-semibold hover:underline">{post.name}</span>
              </Link>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {post.createdAt}
              </span>
            </div>
          </div>
          <div className="relative">
            <MoreHorizIcon
              className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Post options"
            />
            {menuOpen && post.userId === currentUser?.id && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 shadow-lg rounded-lg py-2 px-4 z-10 animate-fade-in">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full text-left text-red-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Delete post"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="my-6">
          <p className="text-base leading-relaxed">{post.desc}</p>
          {post.img && (
            <img
              src={post.img}
              alt="Post content"
              className="w-full max-h-[500px] object-cover mt-4 rounded-lg"
            />
          )}
        </div>
        {error && (
          <div className="flex items-center text-red-500 text-sm mb-4 animate-pulse">
            <span>{error}</span>
            <button
              onClick={handleResetError}
              className="ml-2 text-blue-500 hover:underline"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex items-center gap-6 text-sm">
          <button
            className="flex items-center gap-2 cursor-pointer hover:text-red-500 disabled:opacity-50"
            onClick={handleHeart}
            disabled={isLoading || !currentUser?.id}
            aria-label={hasHearted ? "Unheart post" : "Heart post"}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : hasHearted ? (
              <FavoriteOutlinedIcon className="text-red-500" />
            ) : (
              <FavoriteBorderOutlinedIcon className="text-gray-500" />
            )}
            <span>{postHearts.length} Hearts</span>
          </button>
          <button
            className="flex items-center gap-2 cursor-pointer hover:text-blue-500"
            onClick={() => setCommentOpen(!commentOpen)}
            aria-label="View comments"
          >
            <TextsmsOutlinedIcon />
            <span>{post.totalComments} Comments</span>
          </button>
          <button
            className="flex items-center gap-2 cursor-pointer hover:text-green-500 relative"
            onClick={handleShare}
            aria-label="Share post"
          >
            <ShareOutlinedIcon />
            <span>Share</span>
            {shareMessage && (
              <span className="absolute -top-8 left-0 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                {shareMessage}
              </span>
            )}
          </button>
        </div>
        {commentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;