import { ChatMessage, ChatMessageProps } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, XCircle, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  onCancelRequest?: () => void;
  onClearChat?: () => void;
  messages: ChatMessageProps[];
  connectionStatus: string;
  onOpenSettings: () => void;
  hasActiveRequest?: boolean;
}

export function ChatPanel({
  onSendMessage,
  onCancelRequest,
  onClearChat,
  messages,
  connectionStatus,
  hasActiveRequest = false,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme, setTheme } = useTheme();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      inputValue.trim() &&
      connectionStatus === "connected" &&
      !hasActiveRequest
    ) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="text-lg font-semibold">SMC Assistant</h2>
        <div className="flex items-center space-x-2">
          <div
            className={`size-3 rounded-full animate-pulse ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-gray-400"
            }`}
          />
          <div className="flex items-center mr-2">
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              className="mx-1"
              iconOn={<Moon className="h-3 w-3 text-blue-300" />}
              iconOff={<Sun className="h-3 w-3 text-yellow-300" />}
            />
          </div>
          <Button
            onClick={onClearChat}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={messages.length <= 1}
            aria-label="Clear chat"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 theme-scrollbar">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            loading={hasActiveRequest && index == messages.length - 1}
            {...msg}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3">
        <form onSubmit={handleSubmit} className="flex justify-center items-end gap-2">
          <div className="relative w-[50%]">
            <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                connectionStatus === "connected"
                  ? hasActiveRequest
                    ? "Waiting for response..."
                    : "Type a message..."
                  : "Connect to start chatting..."
              }
              disabled={connectionStatus !== "connected" || hasActiveRequest}
              className="min-h-[100px] max-h-[120px] resize-none scrollbar-hide"
              rows={1}
              style={{ scrollbarWidth: "none" }}
            />
          </div>
          <div className="absolute right-2 bottom-2 ">{hasActiveRequest && onCancelRequest ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onCancelRequest}
              className="h-10 w-10"
            >
              <XCircle size={18} />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={
                !inputValue.trim() ||
                connectionStatus !== "connected" ||
                hasActiveRequest
              }
              className="h-10 w-10"
            >
              <Send size={18} />
            </Button>
          )}</div>
          </div>
        </form>
      </div>
    </div>
  );
}
