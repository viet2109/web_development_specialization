import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileAudio,
  FaFileCode,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileVideo,
  FaFileWord,
  FaImage,
  FaMapMarkerAlt,
  FaPaperclip,
  FaPlus,
  FaSmile,
  FaSpinner,
  FaTimes,
  FaUserTag
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../hook/hook";
import { sharePost } from "../redux/shareSlice";

const Share = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  // Utility functions: getFileIcon, getFileColor, formatFileSize (unchanged)...

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (type.startsWith("image/")) return FaImage;
    if (type.startsWith("video/")) return FaFileVideo;
    if (type.startsWith("audio/")) return FaFileAudio;
    if (type === "application/pdf") return FaFilePdf;
    if (type.includes("word") || extension === "doc" || extension === "docx")
      return FaFileWord;
    if (type.includes("sheet") || extension === "xls" || extension === "xlsx")
      return FaFileExcel;
    if (
      type.includes("presentation") ||
      extension === "ppt" ||
      extension === "pptx"
    )
      return FaFilePowerpoint;
    if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
      return FaFileArchive;
    if (
      type.includes("javascript") ||
      type.includes("json") ||
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "css",
        "py",
        "java",
        "cpp",
        "c",
      ].includes(extension || "")
    )
      return FaFileCode;
    if (type.includes("text") || extension === "txt") return FaFileAlt;

    return FaFile;
  };

  const getFileColor = (file: File) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (type.startsWith("image/")) return "text-green-500";
    if (type.startsWith("video/")) return "text-red-500";
    if (type.startsWith("audio/")) return "text-purple-500";
    if (type === "application/pdf") return "text-red-600";
    if (type.includes("word") || extension === "doc" || extension === "docx")
      return "text-blue-600";
    if (type.includes("sheet") || extension === "xls" || extension === "xlsx")
      return "text-green-600";
    if (
      type.includes("presentation") ||
      extension === "ppt" ||
      extension === "pptx"
    )
      return "text-orange-500";
    if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
      return "text-yellow-600";
    if (
      type.includes("javascript") ||
      type.includes("json") ||
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "css",
        "py",
        "java",
        "cpp",
        "c",
      ].includes(extension || "")
    )
      return "text-indigo-500";
    if (type.includes("text") || extension === "txt") return "text-gray-500";

    return "text-gray-400";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Prevent duplicate files by name, size, and lastModified
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      // Filter out any files already in state
      const filtered = selectedFiles.filter(
        (sf) =>
          !files.some(
            (f) =>
              f.name === sf.name &&
              f.size === sf.size &&
              f.lastModified === sf.lastModified
          )
      );
      const remainingSlots = 10 - files.length;
      const filesToAdd = filtered.slice(0, remainingSlots);
      setFiles((prev) => [...prev, ...filesToAdd]);
    }
    e.target.value = "";
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isLoading) return;

    setIsLoading(true);
    try {
      const payload: { content: string; files?: File[] } = { content };

      if (files.length > 0) {
        payload.files = files;
      }

      await dispatch(sharePost(payload)).unwrap();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
      setFiles([]);
    } catch (error) {
      console.error("Lỗi khi chia sẻ bài viết:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={
                currentUser.avatar?.path ||
                `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}&background=3b82f6&color=ffffff&size=64`
              }
              alt={`avatar`}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
            />

            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>

          <div className="flex-1">
            <textarea
              placeholder={`Bạn đang nghĩ gì, ${currentUser.firstName}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full resize-none border-none outline-none bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:bg-gray-100 dark:focus:bg-gray-600 transition-colors duration-200"
            />
          </div>
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {files.length} tệp{files.length > 1 ? "" : ""} đã chọn
              </span>
              <button
                onClick={handleRemoveAllFiles}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file);
                const fileColor = getFileColor(file);
                const isImage = file.type.startsWith("image/");

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0">
                      {isImage ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <FileIcon className={`w-6 h-6 ${fileColor}`} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} •{" "}
                        {file.type || "Unknown type"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="flex-shrink-0 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {files.length < 10 && (
                <label
                  htmlFor="file-add"
                  className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <FaPlus className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Thêm tệp
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Còn {10 - files.length} vị trí
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        <hr className="my-5 border-gray-200 dark:border-gray-600" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-9">
            <input
              type="file"
              id="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
            />

            <input
              type="file"
              id="file-add"
              className="hidden"
              multiple
              onChange={handleFileChange}
            />

            <label
              htmlFor="file"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group"
            >
              <FaPaperclip className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
              <span className="font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Đính kèm tệp {files.length > 0 && `(${files.length})`}
              </span>
            </label>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group">
              <FaMapMarkerAlt className="w-4 h-4 text-red-500 group-hover:text-red-600" />
              <span className="font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Địa điểm
              </span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group">
              <FaUserTag className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
              <span className="font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Gắn thẻ
              </span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 group">
              <FaSmile className="w-4 h-4 text-yellow-500 group-hover:text-yellow-600" />
              <span className=" font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                Cảm xúc
              </span>
            </button>
          </div>

          <button
            onClick={handleClick}
            disabled={isLoading || (!content.trim() && files.length === 0)}
            className="px-6 flex-1  py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2 min-w-[100px]"
          >
            {isLoading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline line-clamp-1">
                  Đang chia sẻ...
                </span>
              </>
            ) : (
              <span className="line-clamp-1">Chia sẻ</span>
            )}
          </button>
        </div>

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

        {files.length >= 8 && (
          <div className="mt-2 text-center">
            <span className="text-xs text-amber-500">
              {files.length >= 10
                ? "Đã đạt tối đa 10 tệp"
                : `Cho phép thêm ${10 - files.length} tệp nữa`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Share;
