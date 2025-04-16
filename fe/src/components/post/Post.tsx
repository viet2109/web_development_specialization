import { useState } from "react";
import { Link } from "react-router-dom";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import { api } from "../../api/api";

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
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const likes = post.reactionSummary || [];

  const handleLike = async () => {
    if (!currentUser?.id || !token) return;

    setIsLoading(true);
    try {
      if (likes.includes(currentUser.id)) {
        await api.post(`/posts/${post.id}/unlike`);
        dispatch({
          type: "post/unlikePost",
          payload: { postId: post.id, userId: currentUser.id },
        });
      } else {
        await api.post(`/posts/${post.id}/like`);
        dispatch({
          type: "post/likePost",
          payload: { postId: post.id, userId: currentUser.id },
        });
      }
    } catch (error) {
      console.error("Error handling like/unlike:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.id || !token) return;

    try {
      await api.delete(`/posts/${post.id}`);
      dispatch({ type: "post/deletePost", payload: post.id });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xl">
      <div className="p-5">
        <div className="flex items-center justify-between relative">
          <div className="flex gap-5">
            <img
              src={post.profilePic}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <Link to={`/profile/${post.userId}`} className="no-underline text-inherit">
                <span className="font-medium">{post.name}</span>
              </Link>
              {/* <span className="text-xs">{moment(post.createdAt).fromNow()}</span> */}
            </div>
          </div>
          <MoreHorizIcon
            className="cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && post.userId === currentUser?.id && (
            <button
              onClick={handleDelete}
              className="absolute top-8 right-0 bg-red-500 text-white border-none py-1 px-2 rounded cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
        <div className="my-5 ">
          <p>{post.desc}</p>
          {post.img && (
            <img
              src={post.img}
              alt=""
              className="w-full max-h-[500px] object-cover mt-5"
            />
          )}
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 cursor-pointer text-sm">
            {isLoading ? (
              <span>Loading...</span>
            ) : likes.includes(currentUser?.id || 0) ? (
              <FavoriteOutlinedIcon className="text-red-500" onClick={handleLike} />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {likes.length} Likes
          </div>
          <div
            className="flex items-center gap-2.5 cursor-pointer text-sm"
            onClick={() => setCommentOpen(!commentOpen)}
          >
            <TextsmsOutlinedIcon />
            {post.totalComments} Comments
          </div>
          <div className="flex items-center gap-2.5 cursor-pointer text-sm">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {/* {commentOpen && <Comments postId={post.id} />} */}
      </div>
    </div>
  );
};

export default Post;