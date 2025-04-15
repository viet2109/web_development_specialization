import { useState } from "react";
import { Link } from "react-router-dom";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hook/hook";
import { RootState } from "../../redux/store";
import { deletePost, likePost, unlikePost } from "../../redux/postSlice";
import { useAppSelector } from "../../hook/hook";

interface Post {
  id: number;
  userId: number;
  name: string;
  profilePic: string;
  desc: string;
  img?: string;
  createdAt: string;
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const likes = useSelector((state: RootState) => state.post.likes[post.id] || []);
  const isLoading = useSelector((state: RootState) => state.post.isLoading);

  const handleLike = () => {
    if (currentUser?.id !== undefined && likes.includes(currentUser.id)) {
      dispatch(unlikePost(post.id));
    } else {
      if (currentUser?.id !== undefined) {
        dispatch(likePost({ postId: post.id, userId: currentUser.id }));
      }
    }
  };

  const handleDelete = () => {
    dispatch(deletePost(post.id));
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xl">
      <div className="p-5">
        <div className="flex items-center justify-between relative">
          <div className="flex gap-5">
            <img
              src={`/upload/${post.profilePic}`}
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
        <div className="my-5">
          <p>{post.desc}</p>
          {post.img && (
            <img
              src={`/upload/${post.img}`}
              alt=""
              className="w-full max-h-[500px] object-cover mt-5"
            />
          )}
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 cursor-pointer text-sm">
            {isLoading ? (
              <span>Loading...</span>
            ) : currentUser?.id !== undefined && likes.includes(currentUser.id) ? (
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
            See Comments
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
