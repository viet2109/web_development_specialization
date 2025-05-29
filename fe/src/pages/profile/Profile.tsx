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
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../hook/hook";

interface User {
  id: number;
  name: string;
  coverPic: string;
  profilePic: string;
  city: string;
  website: string;
}

interface ProfileProps {
  user?: User; 
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const userId = parseInt(useLocation().pathname.split("/")[2]);


  const defaultUser: User = {
    id: userId,
    name: "John Doe",
    coverPic: "default-cover.jpg",
    profilePic: "default-profile.jpg",
    city: "New York",
    website: "example.com",
  };

  const profileUser = user || defaultUser;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 min-h-screen">
      <div className="relative w-full h-[300px]">
        <img
          src={`/upload/${profileUser.coverPic}`}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <img
          src={`/upload/${profileUser.profilePic}`}
          alt="Profile"
          className="w-[200px] h-[200px] rounded-full object-cover absolute left-1/2 transform -translate-x-1/2 top-[200px] border-4 border-white dark:border-gray-800"
        />
      </div>
      <div className="px-4 sm:px-10 md:px-16 lg:px-20 pt-20">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between mb-5">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="http://facebook.com" className="text-gray-500 dark:text-gray-300">
              <FacebookTwoToneIcon fontSize="large" />
            </a>
            <a href="http://instagram.com" className="text-gray-500 dark:text-gray-300">
              <InstagramIcon fontSize="large" />
            </a>
            <a href="http://twitter.com" className="text-gray-500 dark:text-gray-300">
              <TwitterIcon fontSize="large" />
            </a>
            <a href="http://linkedin.com" className="text-gray-500 dark:text-gray-300">
              <LinkedInIcon fontSize="large" />
            </a>
            <a href="http://pinterest.com" className="text-gray-500 dark:text-gray-300">
              <PinterestIcon fontSize="large" />
            </a>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {profileUser.name}
            </span>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-300">
                <PlaceIcon />
                <span className="text-sm">{profileUser.city}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-300">
                <LanguageIcon />
                <span className="text-sm">{profileUser.website}</span>
              </div>
            </div>
            {userId === currentUser?.id ? (
              <button
                onClick={() => setOpenUpdate(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Update
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <EmailOutlinedIcon className="text-gray-500 dark:text-gray-300" />
            <MoreVertIcon className="text-gray-500 dark:text-gray-300" />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;