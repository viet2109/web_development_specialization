import Image from "../../assets/images/img.png";
import Map from "../../assets/images/map.png";
import Friend from "../../assets/images/friend.png";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, dispatch } from "../../redux/store";
import { uploadImage, sharePost } from "../../redux/postSlice";

const Share = () => {
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState<string>("");
  const reduxDispatch = useDispatch<typeof dispatch>();

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    let imgUrl = "";

    if (file) {
      imgUrl = await dispatch(uploadImage(file)).unwrap(); // Upload ảnh và lấy URL
    }

    dispatch(sharePost({ desc, img: imgUrl }));
    setDesc("");
    setFile(null);
  };

  return (
    <div className="mb-5 rounded-2xl shadow-[0_0_25px_-10px_rgba(0,0,0,0.38)] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-3">
            <img
              src={`/upload/${currentUser?.email}`}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <input
              type="text"
              placeholder={`What's on your mind ${currentUser?.name}?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
              className="border-none outline-none p-5 pl-2.5 bg-transparent w-[60%] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex-1 flex justify-end">
            {file && (
              <img
                className="w-[100px] h-[100px] object-cover rounded-none"
                alt=""
                src={URL.createObjectURL(file)}
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
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file">
              <div className="flex items-center gap-2.5 cursor-pointer">
                <img src={Image} alt="" className="h-5" />
                <span className="text-xs text-gray-500">Add Image</span>
              </div>
            </label>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <img src={Map} alt="" className="h-5" />
              <span className="text-xs text-gray-500">Add Place</span>
            </div>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <img src={Friend} alt="" className="h-5" />
              <span className="text-xs text-gray-500">Tag Friends</span>
            </div>
          </div>
          <div>
            <button
              onClick={handleClick}
              className="border-none p-1.5 text-white bg-[#5271ff] rounded cursor-pointer"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
