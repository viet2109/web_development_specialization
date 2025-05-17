import { useQuery } from "@tanstack/react-query";
import Post from "../post/Post";
import { api } from "../../api/api";
import { useAppSelector } from "../../hook/hook";
import { useEffect } from "react";

interface File {
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
}

interface Attachment {
  id: number;
  file: File;
}

interface Creator {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
}

interface PostType {
  id: number;
  content: string;
  creator: Creator;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  reactionSummary: number[];
  totalComments: number;
  sharedPost: PostType | null;
}

const Posts = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
console.log("Current User:", currentUser);
  console.log("Token:", token);
  const { isLoading, error, data, refetch } = useQuery<PostType[]>({
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

  if (!currentUser || !token) {
    return <div>Please log in to view posts</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }


  const mappedPosts = data?.map((post: PostType) => ({
    id: post.id,
    userId: post.creator.id,
    name: post.creator.fullName,
    profilePic: post.creator.avatar || "/default-avatar.png", 
    desc: post.content,
    img: post.attachments[0]?.file.type === "image" ? post.attachments[0].file.path : undefined, 
    createdAt: post.createdAt,
    reactionSummary: post.reactionSummary,
    totalComments: post.totalComments,
  }));

  return (
    <div className="flex flex-col gap-12">
      <button
        onClick={() => refetch()}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Refetch Posts
      </button>
      {mappedPosts && mappedPosts.length > 0 ? (
        mappedPosts.map((post) => <Post post={post} key={post.id} />)
      ) : (
        <div>No posts found</div>
      )}
    </div>
  );
};

export default Posts;