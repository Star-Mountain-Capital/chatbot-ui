import { StateCreator } from "zustand";
import { ChatActions, ChatState, ChartSuggestionsByType } from "../types";

export type ChatSlice = ChatState & ChatActions;

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (
  set,
  get
) => ({
  // Initial state
  pending: false,
  status: "disconnected",
  messages: [],
  isConnecting: false,
  progressMap: {},
  filtersMap: {},
  chartSuggestionsMap: {},
  chartDataMap: {},
  rawResultMap: {},
  detailedFormattedResultMap: {},
  detailedRawResultMap: {},
  warehouseQueryMap: {},
  sessionId: "",
  userId: "",
  questions: [],

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

  clearMessages: () => set({ messages: [] }),

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

  setChartSuggestions: (
    messageId: string,
    chartSuggestions: ChartSuggestionsByType
  ) =>
    set((state) => ({
      chartSuggestionsMap: {
        ...state.chartSuggestionsMap,
        [messageId]: chartSuggestions,
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

  setChartData: (messageId, chartType, data) =>
    set((state) => ({
      chartDataMap: {
        ...state.chartDataMap,
        [messageId]: {
          ...(state.chartDataMap[messageId] || {}),
          [chartType]: data,
        },
      },
    })),

  setRawResult: (messageId, rawResult) =>
    set((state) => ({
      rawResultMap: {
        ...state.rawResultMap,
        [messageId]: rawResult,
      },
    })),
  setQuestions: (questions: string[]) => {
    set(() => ({
      questions: questions?.length ? questions : [],
    }));
  },
  removeQuestion: (questionToRemove: string) => {
    set((state) => ({
      questions: state.questions.filter(q => q !== questionToRemove),
    }));
  },
  setDetailedFormattedResult: (messageId, formattedResult) =>
    set((state) => ({
      detailedFormattedResultMap: {
        ...state.detailedFormattedResultMap,
        [messageId]: formattedResult,
      },
    })),

  setDetailedRawResult: (messageId, rawResult) =>
    set((state) => ({
      detailedRawResultMap: {
        ...state.detailedRawResultMap,
        [messageId]: rawResult,
      },
    })),

  setWarehouseQuery: (messageId, isWarehouseQuery) =>
    set((state) => ({
      warehouseQueryMap: {
        ...state.warehouseQueryMap,
        [messageId]: isWarehouseQuery,
      },
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
