import { StateCreator } from "zustand";
import { ChatActions, ChatState } from "../types";
import { MessageRole } from "@/components/ChatMessage";

export type ChatSlice = ChatState & ChatActions;

const initMessage = {
  role: "tool" as MessageRole,
  content: "Hello, how can i help?",
  timestamp: new Date(),
  progressSteps: [],
  messageId: "",
  hasActiveRequest: false,
};

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (
  set,
  get
) => ({
  // Initial state
  pending: false,
  status: "disconnected",
  messages: [initMessage],
  isConnecting: false,
  progressMap: {},
  filtersMap: {},
  sessionId: "",
  userId: "",

  // Actions
  setPending: (pending) => set({ pending }),
  setStatus: (status) => set({ status }),
  setMessages: (messages) => set({ messages }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setProgressMap: (progressMap) => set({ progressMap }),

  addMessage: (role, content, messageId) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          role,
          content,
          timestamp: new Date(),
          progressSteps: [],
          messageId,
          hasActiveRequest: role === "tool",
          thinkingStartTime: role === "tool" ? new Date() : undefined,
          pending: role === "user" ? true : false,
        },
      ],
    })),

  clearMessages: () => set({ messages: [initMessage] }),

  updateProgressMap: (messageId, progress) =>
    set((state) => ({
      progressMap: {
        ...state.progressMap,
        [messageId]: [...(state.progressMap[messageId] || []), progress],
      },
    })),

  setThinkingStartTime: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.messageId === messageId
          ? { ...msg, thinkingStartTime: new Date() }
          : msg
      ),
    })),

  setThinkingEndTime: (messageId, endTime) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.messageId === messageId ? { ...msg, thinkingEndTime: endTime } : msg
      ),
    })),

  updateMessageContent: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.messageId === messageId
          ? { ...msg, content, hasActiveRequest: false }
          : msg
      ),
    })),

  setFilters: (messageId, filters) =>
    set((state) => ({
      filtersMap: {
        ...state.filtersMap,
        [messageId]: filters,
      },
    })),

  clearFilters: () =>
    set(() => {
      return { filtersMap: {} };
    }),

  setSessionId: (sessionId) => set({ sessionId }),
  
  setUserId: (userId) => set({ userId }),

  setMessagePending: (messageId, pending) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.messageId === messageId ? { ...msg, pending } : msg
      ),
    })),

  completeQuery: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.messageId === messageId ? { ...msg, pending: false } : msg
      ),
    })),

  requireFilters: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.messageId === messageId ? { ...msg, pending: false } : msg
      ),
    })),

  getThinkingTime: (messageId) => {
    const { messages } = get();
    const message = messages.find((m) => m.messageId === messageId);
    if (!message) return 0;
    const { thinkingStartTime, thinkingEndTime } = message;
    if (!thinkingStartTime || !thinkingEndTime) return 0;
    const duration = thinkingEndTime.getTime() - thinkingStartTime.getTime();
    return Math.floor(duration / 1000);
  },
});
