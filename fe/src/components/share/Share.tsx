import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  FaImage,
  FaMapMarkerAlt,
  FaSmile,
  FaSpinner,
  FaTimes,
  FaUser,
  FaUserTag,
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import { sharePost } from "../../redux/shareSlice";

const Share = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
  };

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isLoading) return;

    setIsLoading(true);
    try {
      const payload: { content: string; files?: File } = {
        content,
      };

      if (file) {
        payload.files = file;
      }

      await dispatch(sharePost(payload)).unwrap();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
      setFile(null);
    } catch (error) {
      console.error("Error sharing post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {currentUser.avatar?.path ? (
              <img
                src={currentUser.avatar.path}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-blue-100 dark:ring-blue-900 flex items-center justify-center">
                <FaUser className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>

          <div className="flex-1">
            <textarea
              placeholder={`What's on your mind, ${currentUser.firstName}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full resize-none border-none outline-none bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Image Preview Section */}
        {file && (
          <div className="mb-4 relative inline-block">
            <div className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl shadow-md"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <hr className="my-5 border-gray-200 dark:border-gray-600" />

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <input
              type="file"
              id="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />

            <label
              htmlFor="file"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group"
            >
              <FaImage className="w-4 h-4 text-green-500 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Photo
              </span>
            </label>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group">
              <FaMapMarkerAlt className="w-4 h-4 text-red-500 group-hover:text-red-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Location
              </span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group">
              <FaUserTag className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Tag
              </span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group">
              <FaSmile className="w-4 h-4 text-yellow-500 group-hover:text-yellow-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Feeling
              </span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleClick}
            disabled={isLoading || (!content.trim() && !file)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2 min-w-[100px]"
          >
            {isLoading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Sharing...</span>
              </>
            ) : (
              <span>Share</span>
            )}
          </button>
        </div>

        {/* Character Counter (Optional) */}
        {content.length > 200 && (
          <div className="mt-2 text-right">
            <span
              className={`text-xs ${
                content.length > 280 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {content.length}/300
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Share;
