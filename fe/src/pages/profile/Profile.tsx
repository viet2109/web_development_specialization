import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";


import { api } from "../../api/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

// Define interface for user data
interface User {
  id: number;
  name: string;
  coverPic: string;
  profilePic: string;
  city: string;
  website: string;
}

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const userId = parseInt(location.pathname.split("/")[2]);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () =>
      api.get("/users/find/" + userId).then((res) => res.data),
  });

  const { isLoading: rIsLoading, data: relationshipData } = useQuery<number[]>({
    queryKey: ["relationship"],
    queryFn: () =>
      api.get("/relationships?followedUserId=" + userId).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (following: boolean) => {
      if (following) {
        return api.delete("/relationships?userId=" + userId);
      }
      return api.post("/relationships", { userId });
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries(["relationship"]);
    // },
  });

//   const handleFollow = () => {
//     if (relationshipData) {
//       mutation.mutate(relationshipData.includes());
//     }
//   };

  return (
    <div className="bg-gray-100 min-h-screen">
      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          <div className="relative w-full h-[300px]">
            <img
              src={`/upload/${data?.coverPic}`}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <img
              src={`/upload/${data?.profilePic}`}
              alt="Profile"
              className="w-[200px] h-[200px] rounded-full object-cover absolute left-1/2 -translate-x-1/2 top-[200px] border-4 border-white"
            />
          </div>
          <div className="px-5 md:px-16 lg:px-20 pt-24 pb-5">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 flex flex-col md:flex-row items-center justify-between mb-5">
              <div className="flex gap-3 mb-4 md:mb-0">
                <a href="http://facebook.com" className="text-gray-600 hover:text-blue-600">
                  <FacebookTwoToneIcon fontSize="large" />
                </a>
                <a href="http://facebook.com" className="text-gray-600 hover:text-pink-600">
                  <InstagramIcon fontSize="large" />
                </a>
                <a href="http://facebook.com" className="text-gray-600 hover:text-blue-400">
                  <TwitterIcon fontSize="large" />
                </a>
                <a href="http://facebook.com" className="text-gray-600 hover:text-blue-800">
                  <LinkedInIcon fontSize="large" />
                </a>
                <a href="http://facebook.com" className="text-gray-600 hover:text-red-600">
                  <PinterestIcon fontSize="large" />
                </a>
              </div>

              <div className="text-center flex-1 mb-4 md:mb-0">
                <span className="text-2xl md:text-3xl font-semibold text-gray-800">
                  {data?.name}
                </span>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-1 text-gray-600">
                    <PlaceIcon />
                    <span className="text-sm">{data?.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <LanguageIcon />
                    <span className="text-sm">{data?.website}</span>
                  </div>
                </div>
                {rIsLoading ? (
                  <div className="mt-3">Loading...</div>
                ) : userId === currentUser.id ? (
                  <button
                    onClick={() => setOpenUpdate(true)}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md transition-colors"
                  >
                    Update
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md transition-colors"
                  >
                    {relationshipData?.includes(currentUser.id) ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <EmailOutlinedIcon className="text-gray-600" />
                <MoreVertIcon className="text-gray-600" />
              </div>
            </div>
            <Posts userId={userId} />
          </div>
        </>
      )}
      {openUpdate && data && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;