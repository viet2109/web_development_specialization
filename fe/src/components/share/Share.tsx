import ImageIcon from "../../assets/images/img.png";
import MapIcon from "../../assets/images/map.png";
import FriendIcon from "../../assets/images/friend.png";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import { sharePost } from "../../redux/shareSlice";
const Share = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>("");

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const payload: { content: string;  files?: File } = {
        content,
      };

      if (file) {
        payload.files = file;
      }

      await dispatch(sharePost(payload)).unwrap();
      setContent("");
      setFile(null);
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mb-5 rounded-2xl shadow-[0_0_25px_-10px_rgba(0,0,0,0.38)] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-3">
            <img
              src={`/upload/${currentUser.email}`}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col gap-2 w-[60%]">
              <input
                type="text"
                placeholder={`What's on your mind, ${currentUser.name}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none outline-none p-5 pl-2.5 bg-transparent w-full text-gray-900 dark:text-gray-100"
              />
             
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-[100px] h-[100px] object-cover"
              />
            )}
          </div>
        </div>

        <hr className="my-5 border-none h-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={handleImageChange}
            />
            <label htmlFor="file" className="flex items-center gap-2.5 cursor-pointer">
              <img src={ImageIcon} alt="Add" className="h-5" />
              <span className="text-xs text-gray-500">Add Image</span>
            </label>

            <div className="flex items-center gap-2.5 cursor-pointer">
              <img src={MapIcon} alt="Map" className="h-5" />
              <span className="text-xs text-gray-500">Add Place</span>
            </div>

            <div className="flex items-center gap-2.5 cursor-pointer">
              <img src={FriendIcon} alt="Friend" className="h-5" />
              <span className="text-xs text-gray-500">Tag Friends</span>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="border-none p-1.5 text-white bg-[#5271ff] rounded cursor-pointer"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default Share;