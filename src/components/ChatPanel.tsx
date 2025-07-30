import React, { useEffect } from "react";
import { ChatMessage, ChatMessageProps } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, XCircle, Info } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ContextMenu } from "./ContextMenu";
import { FilterInput } from "./FilterInput";
import { QuestionsSelector } from "./QuestionsSelector";
import { useChatInput } from "@/hooks/useChatInput";
import { useStore } from "@/store";

// Custom tooltip content with improved arrow styling
function CustomTooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={className}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-blue-200/50 dark:fill-blue-800/50 z-50 size-2.5 translate-y-[1px]  rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  onCancelRequest?: () => void;
  onSendFilterResponse?: (filterValues: Record<string, string>) => void;
  messages: ChatMessageProps[];
  connectionStatus: string;
  progressMap?: Record<string, string[]>;
  currentMessageId?: string | null;
  hasActiveRequest?: boolean;
}

export const ChatPanel = React.memo(function ChatPanel({
  onSendMessage,
  onCancelRequest,
  onSendFilterResponse,
  messages,
  connectionStatus,
  progressMap = {},
  hasActiveRequest = false,
}: ChatPanelProps) {
  const { questions, removeQuestion } = useStore();

  const handleRunQuestion = (question: string) => {
    onSendMessage(question);
    removeQuestion(question);
  };

  // Hide questions selector when there's an active request
  const shouldShowQuestions = questions.length > 0 && !hasActiveRequest && connectionStatus === "connected";
  const {
    inputValue,
    setInputValue,
    showTooltip,
    textareaRef,
    messagesEndRef,
    activeFilters,
    handleSubmit,
    setIsHovering,
  } = useChatInput({
    messages,
    onSendMessage,
    connectionStatus,
    hasActiveRequest,
  });

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 theme-scrollbar flex justify-center">
        <div className="w-[50%]">
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.messageId}
              loading={hasActiveRequest && index == messages.length - 1}
              {...msg}
              progressSteps={progressMap[msg.messageId]}
            />
          ))}
          {shouldShowQuestions && <QuestionsSelector
            questions={questions}
            onRunQuestion={handleRunQuestion}
            disabled={hasActiveRequest || connectionStatus !== "connected"}
          />}
        </div>
      </div>

      <div className="p-3">
        <form
          onSubmit={handleSubmit}
          className="flex justify-center items-end gap-2"
        >
          <div className="relative w-[50%]">
            {/* Show FilterInput when there are active filters */}
            {activeFilters && onSendFilterResponse && (
              <FilterInput
                filters={activeFilters.filters}
                messageId={activeFilters.messageId}
                onSubmit={onSendFilterResponse}
              />
            )}

            <div className="absolute flex items-center gap-2 w-full p-2 z-50">
              <ContextMenu />
            </div>
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
                className="min-h-[150px] max-h-[120px] resize-none scrollbar-hide pt-10"
                rows={1}
                style={{ scrollbarWidth: "none" }}
              />
            </div>
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <Tooltip open={showTooltip}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={`h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 rounded-full ${
                      showTooltip ? "animate-pulse" : ""
                    }`}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <Info size={16} />
                  </Button>
                </TooltipTrigger>
                <CustomTooltipContent
                  side="top"
                  sideOffset={8}
                  className="max-w-sm p-4 text-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/90 dark:to-indigo-950/90 border border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <Info
                          size={12}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-xs uppercase tracking-wide">
                        💡 Pro Tip
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Ask specific measure queries about the{" "}
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          Monitoring Workbook
                        </span>{" "}
                        and the{" "}
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          Loan Tape Report
                        </span>
                        . You can ask about fund, investment, or security
                        information. Make sure to provide correct entity names
                        and specify dates and needed filters (period end, as of
                        date, monthly/quarterly views).
                      </p>
                    </div>
                  </div>
                </CustomTooltipContent>
              </Tooltip>
              {hasActiveRequest && onCancelRequest ? (
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
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});
