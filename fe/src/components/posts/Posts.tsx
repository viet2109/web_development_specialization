import { useQuery } from "@tanstack/react-query";
import Post from "../post/Post";
import axios from "axios";

interface PostType {
  id: number;
  userId: number;
  name: string;
  profilePic: string;
  desc: string;
  img?: string;
  createdAt: string;
  [key: string]: any;
}

interface PostsProps {
  userId?: string | number; 
}

const Posts = ({ userId }: PostsProps) => {
  const { isLoading, error, data } = useQuery<PostType[]>({
    queryKey: ["posts", userId], 
    queryFn: () =>
      axios.get(`/posts?userId=${userId}`).then((res) => {
        const filteredData = res.data.filter(
          (v: PostType, i: number, a: PostType[]) =>
            a.findIndex((v2: PostType) => v2.id === v.id) === i
        );
        return filteredData;
      }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  return (
  
    <div className="flex flex-col gap-12">
      {data && data.length > 0 ? (
        data.map((post: PostType) => (
          <Post post={post} key={post.id} />
        ))
      ) : (
        <div>No posts found</div>
      )}

      
    </div>
  );
};

export default Posts;
