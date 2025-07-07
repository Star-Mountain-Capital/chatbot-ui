import { Filter, Session, SessionsData } from "@/store/types";

// Add MessageRole type
export type MessageRole = "user" | "assistant" | "system" | "tool";

interface ChatHistoryMessage {
  message_id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  message_order: number;
  metadata?: {
    step?: string;
    progress?: number;
    event_type?: string;
    message_type?: string;
    workflow_data?: {
      step?: string;
      message?: string;
      progress?: number;
      message_id?: string;
    };
    [key: string]: unknown;
  };
}

interface ProgressPayload {
  type: string;
  update_type?: string;
  data?: {
    message_id: string;
    message?: string;
    step?: string;
    filters?: Filter[];
    sessions_data?: SessionsData;
    session_id?: string;
    title?: string;
    user_id?: string;
  };
  result?: {
    message_id: string;
    message?: string;
    step?: string;
    filters?: Filter[];
  };
  content?: string;
  sessions_data?: SessionsData;
  session_id?: string;
  history_data?: {
    success: boolean;
    session_id: string;
    messages: ChatHistoryMessage[];
    message_count: number;
  };
  timestamp?: string;
}

type AddMessage = (role: MessageRole, content: string, messageId: string) => void;
type SetProgressMap = (map: Record<string, string[]>) => void;
type UpdateProgressMap = (messageId: string, message: string) => void;
type SetPending = (pending: boolean) => void;
type SetThinkingStartTime = (messageId: string) => void;
type SetThinkingEndTime = (messageId: string, date: Date) => void;
type SetFilters = (messageId: string, filters: Filter[]) => void;
type SetSessionsData = (data: SessionsData) => void;
type AddSession = (session: Session) => void;
type CompleteQuery = (messageId: string) => void;
type RequireFilters = (messageId: string) => void;
type ClearMessages = () => void;

export class WebSocketMessageHandler {
  private addMessage: AddMessage;
  private setProgressMap: SetProgressMap;
  private updateProgressMap: UpdateProgressMap;
  private setPending: SetPending;
  private setThinkingStartTime: SetThinkingStartTime;
  private setThinkingEndTime: SetThinkingEndTime;
  private setFilters: SetFilters;
  private setSessionsData: SetSessionsData;
  private addSession: AddSession;
  private completeQuery: CompleteQuery;
  private requireFilters: RequireFilters;
  private clearMessages: ClearMessages;

  constructor({
    addMessage,
    setProgressMap,
    updateProgressMap,
    setPending,
    setThinkingStartTime,
    setThinkingEndTime,
    setFilters,
    setSessionsData,
    addSession,
    completeQuery,
    requireFilters,
    clearMessages,
  }: {
    addMessage: AddMessage;
    setProgressMap: SetProgressMap;
    updateProgressMap: UpdateProgressMap;
    setPending: SetPending;
    setThinkingStartTime: SetThinkingStartTime;
    setThinkingEndTime: SetThinkingEndTime;
    setFilters: SetFilters;
    setSessionsData: SetSessionsData;
    addSession: AddSession;
    completeQuery: CompleteQuery;
    requireFilters: RequireFilters;
    clearMessages: ClearMessages;
  }) {
    this.addMessage = addMessage;
    this.setProgressMap = setProgressMap;
    this.updateProgressMap = updateProgressMap;
    this.setPending = setPending;
    this.setThinkingStartTime = setThinkingStartTime;
    this.setThinkingEndTime = setThinkingEndTime;
    this.setFilters = setFilters;
    this.setSessionsData = setSessionsData;
    this.addSession = addSession;
    this.completeQuery = completeQuery;
    this.requireFilters = requireFilters;
    this.clearMessages = clearMessages;
  }

  handleMessage(payload: unknown) {
    if (typeof payload !== "object" || payload === null) return;
    const data = payload as ProgressPayload;
    switch (data.type) {
      case "progress":
        this.handleProgress(data);
        break;
      case "query_completed":
        this.handleQueryCompleted(data);
        break;
      case "chat_history_response":
        this.handleChatHistoryResponse(data);
        break;
      case "connected":
        if (data.sessions_data) {
          this.setSessionsData(data.sessions_data);
        }
        break;
      default:
        break;
    }
  }

  private handleProgress(data: ProgressPayload) {
    const { message_id, message, step, filters, session_id, title } = data.data || {};
    if (data.update_type === "title_generated" && session_id && title) {
      const newSession = {
        session_id,
        title,
        created_at: data.timestamp || new Date().toISOString(),
        updated_at: data.timestamp || new Date().toISOString(),
        is_active: true,
        metadata: {
          query_type: "assistant_query",
          session_id,
          workflow_type: "default",
        },
      };
      this.addSession(newSession);
    }
    if (message && message_id) {
      this.updateProgressMap(message_id, message);
    }
    if (step === "waiting_filters" && filters && message_id) {
      this.setFilters(message_id, filters);
      this.requireFilters(message_id);
    } else if (step === "complete" && message_id) {
      this.setPending(false);
      this.completeQuery(message_id);
    }
  }

  private handleQueryCompleted(data: ProgressPayload) {
    const { message_id, message } = data.data || data.result || {};
    if (message && message_id) {
      this.addMessage("tool", message, message_id);
    }
    if (message_id) {
      this.setPending(false);
      this.setThinkingEndTime(message_id, new Date());
      this.completeQuery(message_id);
    }
  }

  private handleChatHistoryResponse(data: ProgressPayload) {
    const messages = data.history_data?.messages;
    if (!messages) return;
    this.clearMessages();
    const newProgressMap: Record<string, string[]> = {};
    const sortedMessages = [...messages].sort((a, b) => a.message_order - b.message_order);
    sortedMessages.forEach((msg) => {
      const { role, content, metadata } = msg;
      if (role === "user" || role === "assistant" || role === "tool") {
        this.addMessage(role, content, metadata?.message_id as string);
      } else if (role === "system") {
        if (metadata?.workflow_data?.message_id) {
          const progressMessageId = metadata.workflow_data.message_id;
          if (!newProgressMap[progressMessageId]) {
            newProgressMap[progressMessageId] = [];
          }
          newProgressMap[progressMessageId].push(content);
        }
      }
    });
    this.setProgressMap(newProgressMap);
  }
} 