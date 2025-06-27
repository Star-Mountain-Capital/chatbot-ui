import { cn } from "@/lib/utils";

export type MessageRole = "user" | "tool";

export interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
  loading?: boolean;
  progressSteps: string[];
  messageId: string;
  thinkingEndTime?: Date;
  thinkingStartTime?: Date;
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { useState, useEffect } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useStore } from "@/store";

export function ChatMessage({
  content,
  role,
  timestamp,
  progressSteps,
  messageId,
}: ChatMessageProps) {
  const { pending, getThinkingTime } = useStore();
  const [isOpen, setIsOpen] = useState(true);

  // Close accordion when pending becomes false
  useEffect(() => {
    if (!pending) {
      setIsOpen(false);
    }
  }, [pending]);

  return (
    <div>
      <div
        className={cn(
          "py-3 px-4 rounded-lg mb-3 max-w-[100%]",
          role === "user"
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted text-foreground rounded-tl-none"
        )}
      >
        {timestamp && (
          <div className="flex items-center mb-1">
            <span className="text-xs opacity-70 ml-auto">
              {timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            a: (props) => (
              <a
                {...props}
                className="text-primary underline hover:opacity-80"
              />
            ),
            img: (props) => (
              <img
                {...props}
                className="rounded-lg max-h-64 object-contain mx-auto"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {progressSteps?.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={isOpen ? "item-1" : ""}
          onValueChange={(value) => setIsOpen(value === "item-1")}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <span>
                  {pending
                    ? "Thinking"
                    : `Thought for ${getThinkingTime(messageId)} seconds`}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col mb-2">
                <div className="w-full max-w-md">
                  {progressSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-[50%] w-0.5",
                            idx !== 0 && "bg-blue-300"
                          )}
                        />
                        <div
                          className={`w-2 h-2 rounded-full bg-blue-500 justify-center ${
                            idx === 0 ? "animate-pulse" : ""
                          }`}
                          style={{ zIndex: 1 }}
                        />
                        <div
                          className={cn(
                            "h-[50%] w-0.5",
                            idx !== progressSteps.length - 1 && "bg-blue-300"
                          )}
                        />
                      </div>
                      <div className="py-1">
                        <div className="ml-2 text-sm text-blue-900 dark:text-blue-100 bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded shadow animate-fade-in">
                          {step}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
