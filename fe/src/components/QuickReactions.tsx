import React, { useState } from "react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

interface QuickReactionsProps {
  commentId: number;
  onEmojiSelect: (emojiData: any, commentId: number) => void;
  reactionSummary: any[];
  userReactionEmoji?: string;
}

const QuickReactions: React.FC<QuickReactionsProps> = React.memo(
  ({ commentId, onEmojiSelect, reactionSummary, userReactionEmoji }) => {
    const [showAll, setShowAll] = useState(false);

    return (
      <div className="flex items-center space-x-1">
        {QUICK_REACTIONS.map((emoji) => {
          const reaction = reactionSummary.find((r) => r.emoji === emoji);
          const count = reaction?.count || 0;
          const isActive = userReactionEmoji === emoji;

          return (
            <button
              key={emoji}
              onClick={() => onEmojiSelect({ emoji }, commentId)}
              className={`relative group flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-110 ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title={`${emoji} ${count > 0 ? count : ""}`}
            >
              <span className="text-sm">{emoji}</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => setShowAll(!showAll)}
          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200"
          title="Thêm cảm xúc"
        >
          <span className="text-lg">+</span>
        </button>
      </div>
    );
  }
);

export default QuickReactions;
