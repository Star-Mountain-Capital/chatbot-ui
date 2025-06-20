import { cn } from "@/lib/utils";

export type MessageRole = "user" | "tool";

export interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
  loading?: boolean;
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export function ChatMessage({
  content,
  role,
  timestamp,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "py-3 px-4 rounded-lg mb-3 max-w-[95%]",
        role === "user"
          ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
          : "bg-muted text-foreground mr-auto rounded-tl-none",
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
            <a {...props} className="text-primary underline hover:opacity-80" />
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
  );
}
