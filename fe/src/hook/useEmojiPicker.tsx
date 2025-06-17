import { useCallback, useState } from "react";
import GlobalEmojiPicker from "../components/GlobalEmojiPicker";

interface UseEmojiPickerReturn {
  showEmojiPicker: (
    commentId: number,
    buttonElement: HTMLButtonElement,
    onEmojiSelect: (emojiData: any, commentId: number) => void
  ) => void;
  hideEmojiPicker: () => void;
  EmojiPickerPortal: React.FC;
}

export const useEmojiPicker = (): UseEmojiPickerReturn => {
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    commentId: number | null;
    position: { top: number; left: number };
    onEmojiSelect: ((emojiData: any, commentId: number) => void) | null;
  }>({
    isOpen: false,
    commentId: null,
    position: { top: 0, left: 0 },
    onEmojiSelect: null,
  });

  const showEmojiPicker = useCallback(
    (
      commentId: number,
      buttonElement: HTMLButtonElement,
      onEmojiSelect: (emojiData: any, commentId: number) => void
    ) => {
      const rect = buttonElement.getBoundingClientRect();
      setPickerState({
        isOpen: true,
        commentId,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
        },
        onEmojiSelect,
      });
    },
    []
  );

  const hideEmojiPicker = useCallback(() => {
    setPickerState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleEmojiClick = useCallback(
    (emojiData: any) => {
      if (pickerState.onEmojiSelect && pickerState.commentId) {
        pickerState.onEmojiSelect(emojiData, pickerState.commentId);
      }
      hideEmojiPicker();
    },
    [pickerState.onEmojiSelect, pickerState.commentId, hideEmojiPicker]
  );

  const EmojiPickerPortal: React.FC = useCallback(
    () => (
      <GlobalEmojiPicker
        isOpen={pickerState.isOpen}
        position={pickerState.position}
        onEmojiClick={handleEmojiClick}
        onClose={hideEmojiPicker}
      />
    ),
    [pickerState, handleEmojiClick, hideEmojiPicker]
  );

  return {
    showEmojiPicker,
    hideEmojiPicker,
    EmojiPickerPortal,
  };
};
