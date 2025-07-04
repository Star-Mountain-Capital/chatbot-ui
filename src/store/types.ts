import { ChatMessageProps, MessageRole } from "@/components/ChatMessage";
import { BusinessEntitiesSlice } from "./slices/businessEntitiesSlice";

export interface Filter {
  column: string;
  enum_values?: string[];
  format?: string;
  is_required: boolean;
  name: string;
  table: string;
  type: string;
}

export type Status = "connected" | "disconnected" | "error";

export interface SelectedItem {
  id: string;
  name: string;
  type: string;
}

export interface Session {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  metadata: {
    query_type: string;
    session_id: string;
    workflow_type: string;
  };
}

export interface SessionsData {
  success: boolean;
  user_id: string;
  connection_id: string;
  sessions: Session[];
  session_count: number;
  session_summaries: unknown[];
  active_connections: unknown[];
  sorted_by: string;
  sort_order: string;
  connection_timestamp: number;
  sort_preferences: {
    sort_by: string;
    sort_order: string;
  };
  available_sort_options: {
    fields: string[];
    orders: string[];
  };
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
  clearFilters: () => void;
  setSessionId: (sessionId: string) => void;
  setUserId: (userId: string) => void;
  setMessagePending: (messageId: string, pending: boolean) => void;
  completeQuery: (messageId: string) => void;
  requireFilters: (messageId: string) => void;
}

export interface SessionState {
  sessions: Session[];
  sessionsData: SessionsData | null;
}

export interface SessionActions {
  setSessions: (sessions: Session[]) => void;
  setSessionsData: (sessionsData: SessionsData) => void;
  addSession: (session: Session) => void;
}

export type ChatSlice = ChatState & ChatActions;
export type SessionSlice = SessionState & SessionActions;

export type StoreSlice = ChatSlice & SessionSlice & BusinessEntitiesSlice;
