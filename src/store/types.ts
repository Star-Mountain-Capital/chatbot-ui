import { ChatMessageProps, MessageRole } from "@/components/ChatMessage";
import { Status } from "@/lib/client";

export interface Filter {
  column: string;
  enum_values?: string[];
  format?: string;
  is_required: boolean;
  name: string;
  table: string;
  type: string;
}

export interface ChatState {
  pending: boolean;
  status: Status;
  messages: ChatMessageProps[];
  isConnecting: boolean;
  progressMap: Record<string, string[]>;
  filtersMap: Record<string, Filter[]>;
  sessionId: string;
  userId: string;
}

export interface ChatActions {
  setPending: (pending: boolean) => void;
  setStatus: (status: Status) => void;
  setMessages: (messages: ChatMessageProps[]) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setProgressMap: (progressMap: Record<string, string[]>) => void;
  addMessage: (role: MessageRole, content: string, messageId: string) => void;
  clearMessages: () => void;
  updateProgressMap: (messageId: string, progress: string) => void;
  setThinkingStartTime: (messageId: string) => void;
  setThinkingEndTime: (messageId: string, endTime: Date) => void;
  updateMessageContent: (messageId: string, content: string) => void;
  getThinkingTime: (messageId: string) => number;
  setFilters: (messageId: string, filters: Filter[]) => void;
  setSessionId: (sessionId: string) => void;
  setUserId: (userId: string) => void;
}

export type ChatSlice = ChatState & ChatActions;

export type StoreSlice = ChatSlice;
