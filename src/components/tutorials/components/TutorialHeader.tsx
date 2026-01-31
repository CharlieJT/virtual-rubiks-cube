import React from "react";
import Button from "@components/UI/Button";

interface TutorialHeaderProps {
  title: string;
  onBack: () => void;
}

const TutorialHeader: React.FC<TutorialHeaderProps> = ({ title, onBack }) => {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-5 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <Button
        onClick={onBack}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-1.5 group"
      >
        <svg
          className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Button>
      <h1 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
        {title}
      </h1>
      <div></div>
    </div>
  );
};

export default TutorialHeader;
