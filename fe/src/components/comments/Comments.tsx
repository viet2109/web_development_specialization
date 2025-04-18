import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useSelector } from "react-redux";

import { useAppDispatch } from "../../hook/hook";
import { RootState } from "../../redux/store";
import { api } from "../../api/api";
import { postComment } from "../../redux/commentSlice";

interface Creator {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string | null;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  creator: Creator;
  attachment?: {
    id: number;
    file: {
      id: string;
    };
    reactionSummary: any[];
  };
  reactionSummary: any[];
  totalChildren: number;
}

interface CommentsResponse {
  content: Comment[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

interface CommentsProps {
  postId: number;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [content, setContent] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isPosting, error: postError } = useSelector((state: RootState) => state.comment);

  const { isLoading, error, data } = useQuery<CommentsResponse>({
    queryKey: ["comments", postId],
    queryFn: () =>
      api.get(`/posts/${postId}/comments?page=0&size=10&sort=createdAt&sort=desc`).then((res) => res.data),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const payload: { content: string; postId: number; attachmentFile?: File } = {
        content,
        postId,
      };
      if (attachmentFile) {
        payload.attachmentFile = attachmentFile;
      }
      await dispatch(postComment(payload)).unwrap();
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setContent("");
      setAttachmentFile(null);
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  return (
    <div className="p-4">
      {postError && <p className="text-red-500 mb-4">{postError}</p>}

      {error ? (
        <p className="text-red-500">Something went wrong</p>
      ) : isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Comment Input */}
          <div className="flex items-center justify-between gap-5 mb-5">
            <div className="flex-1 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Write a comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border border-gray-300 bg-transparent text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
            </div>
            <button
              onClick={handleClick}
              disabled={isPosting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isPosting ? "Posting..." : "Send"}
            </button>
          </div>

          {/* Display Comments */}
          {Array.isArray(data?.content) && data.content.length > 0 ? (
            data.content.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-5 mb-6"
              >
                <img
                  src={comment.attachment?.file?.id ? `/upload/${comment.attachment.file.id}` : "/default-profile.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {comment.creator.email.split("@")[0]}
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {comment.content}
                  </p>
                </div>
                <span className="self-center text-gray-500 text-sm">
                  {moment(comment.createdAt).fromNow()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Comments;