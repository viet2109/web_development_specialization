import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const EmojiPicker = React.lazy(() => import("emoji-picker-react"));

interface GlobalEmojiPickerProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onEmojiClick: (emojiData: any) => void;
  onClose: () => void;
}

const GlobalEmojiPicker: React.FC<GlobalEmojiPickerProps> = ({
  isOpen,
  position,
  onEmojiClick,
  onClose,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={pickerRef}
      className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateY(-100%)",
      }}
    >
      <React.Suspense
        fallback={
          <div className="w-80 h-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          allowExpandReactions={false}
          reactionsDefaultOpen
          width={320}
          height={400}
        />
      </React.Suspense>
    </div>,
    document.body
  );
};
export default GlobalEmojiPicker;
