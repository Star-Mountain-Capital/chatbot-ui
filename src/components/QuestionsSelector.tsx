import React from "react";
import { Button } from "./ui/button";
import { Play, X } from "lucide-react";
import { useStore } from "@/store";

interface QuestionsSelectorProps {
  questions: string[];
  onRunQuestion: (question: string) => void;
  disabled?: boolean;
}

export const QuestionsSelector: React.FC<QuestionsSelectorProps> = ({
  questions,
  onRunQuestion,
  disabled = false,
}) => {
  const { removeQuestion } = useStore();
  if (!questions || questions.length === 0) {
    return null;
  }
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Available Questions ({questions.length})
      </div>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-gray-200 dark:bg-gray-700 rounded-md p-3 flex items-center justify-between"
          >
            <div className="flex-1 pr-3">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {question}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => removeQuestion(question)}>
                <X />
              </Button>
              <Button
                size="sm"
                onClick={() => onRunQuestion(question)}
                disabled={disabled}
                className="flex-shrink-0"
              >
                <Play className="w-3 h-3 mr-1" />
                Run
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
