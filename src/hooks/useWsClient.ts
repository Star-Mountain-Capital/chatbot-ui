/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { WsClient } from "@/lib/wsClient";
import { Filter, SessionsData, ChartSuggestionsByType } from "@/store/types";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/store";

interface UseWsClientOptions {
  serverUrl: string;
  autoConnect?: boolean;
}

interface ChatHistoryMessage {
  message_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  message_order: number;
  raw_data?: string;
  formatted_data?: string;
  chart_suggestions?: string;
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
    chart_suggestions?: ChartSuggestionsByType;
    is_warehouse_query?: boolean;
  };
  result?: {
    message_id: string;
    message?: string;
    step?: string;
    filters?: Filter[];
    chart_suggestions?: ChartSuggestionsByType;
    raw_result?: unknown;
    is_warehouse_query?: boolean;
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

export function useWsClient({
  serverUrl,
  autoConnect = true,
}: UseWsClientOptions) {
  const {
    setStatus,
    setPending,
    updateProgressMap,
    updateMessageContent,
    addMessage,
    setThinkingStartTime,
    setThinkingEndTime,
    setFilters,
    sessionId,
    userId,
    setSessionId,
    setSessionsData,
    clearMessages,
    setProgressMap,
    addSession,
    completeQuery,
    requireFilters,
    setChartSuggestions,
    setRawResult,
    setDetailedFormattedResult,
    setDetailedRawResult,
    setWarehouseQuery,
  } = useStore();

  const [isConnecting, setIsConnecting] = useState(false);

  const clientRef = useRef<WsClient | null>(null);

  /**
   * Handle chat history response and populate messages and progress map
   */
  const handleChatHistoryResponse = useCallback(
    (historyMessages: ChatHistoryMessage[]) => {
      // Clear existing messages
      clearMessages();

      // Initialize progress map
      const newProgressMap: Record<string, string[]> = {};

      // Sort messages by message_order to ensure correct chronological order
      const sortedMessages = [...historyMessages].sort(
        (a, b) => a.message_order - b.message_order
      );
      // Process each message
      sortedMessages.forEach((msg) => {
        const {
          role,
          content,
          metadata,
          raw_data,
          formatted_data,
          chart_suggestions,
          message_id,
        } = msg;
        if (role === "user") {
          // Add user message
          addMessage("user", content, metadata?.message_id as string);
        } else if (role === "assistant") {
          // Add assistant message
          if (
            metadata?.message_type === "dax_response" ||
            metadata?.query_type === "dax_measure"
          ) {
            addMessage(
              "tool",
              content,
              (message_id ?? msg.message_id) as string
            );
          } else {
            addMessage(
              "tool",
              JSON.parse(raw_data ?? "{}") ?? content,
              message_id as string
            );
            setRawResult(message_id as string, JSON.parse(raw_data ?? "{}"));
            setDetailedFormattedResult(
              message_id as string,
              JSON.parse(formatted_data ?? "{}")
            );
            setChartSuggestions(
              message_id as string,
              JSON.parse(chart_suggestions ?? "{}")
            );
          }
        } else if (role === "system") {
          // System messages contain progress information
          if (metadata?.workflow_data?.message_id) {
            const progressMessageId = metadata.workflow_data.message_id;
            if (!newProgressMap[progressMessageId]) {
              newProgressMap[progressMessageId] = [];
            }
            newProgressMap[progressMessageId].push(content);
          }
        }
      });
      // Update progress map with all collected progress
      setProgressMap(newProgressMap);
    },
    [clearMessages, addMessage, setProgressMap]
  );

  /**
   * Establish a WebSocket connection using WsClient.
   */
  const connect = useCallback(
    async (sessionId: string, userId: string) => {
      if (clientRef.current) return; // Already connected

      setIsConnecting(true);

      const client = new WsClient({
        serverUrl,
        onStatusChange: (status) => {
          setStatus(status);
          if (status !== "connected") {
            setIsConnecting(false);
          } else {
            // Send user ID and session ID on connect
            client.send({
              type: "connect",
              data: {
                session_id: sessionId,
                user_id: userId,
              },
            });
          }
        },
        onProgress: (payload: unknown) => {
          if (typeof payload !== "object" || payload === null) return;

          const data = payload as ProgressPayload;
          const type = data.type;
          let message_id: string | undefined;
          let message: string | undefined;
          let step: string | undefined;
          let filters: Filter[] | undefined;
          let chart_suggestions: ChartSuggestionsByType | undefined;
          let raw_result: unknown | undefined;
          let detailed_formatted_result: string | undefined;
          let detailed_raw_result: unknown | undefined;
          let is_warehouse_query: boolean | undefined;
          if (data.data) {
            ({
              message_id,
              message,
              step,
              filters,
              chart_suggestions,
              raw_result,
              detailed_formatted_result,
              detailed_raw_result,
              is_warehouse_query,
            } = data.data as any);
          } else if (data.result) {
            ({
              message_id,
              message,
              step,
              filters,
              chart_suggestions,
              raw_result,
              detailed_formatted_result,
              detailed_raw_result,
              is_warehouse_query,
            } = data.result as any);
          }
          if (chart_suggestions && message_id) {
            setChartSuggestions(message_id, chart_suggestions);
          }
          if (raw_result && message_id) {
            setRawResult(message_id, raw_result);
          }
          if (!!is_warehouse_query && message_id) {
            setWarehouseQuery(message_id, is_warehouse_query);
          }
          if (type === "connected" && data.sessions_data) {
            // Store the sessions data when connected
            setSessionsData(data.sessions_data);
          }

          // Handle chat history response separately as it doesn't require message_id
          if (type === "chat_history_response") {
            if (data.history_data?.messages) {
              handleChatHistoryResponse(data.history_data.messages);
            }
            return;
          }

          if (!message_id) return;

          switch (type) {
            case "progress": {
              // Handle title_generated update_type
              if (
                data.update_type === "title_generated" &&
                data.data?.session_id &&
                data.data?.title
              ) {
                const newSession = {
                  session_id: data.data.session_id,
                  title: data.data.title,
                  created_at: data.timestamp || new Date().toISOString(),
                  updated_at: data.timestamp || new Date().toISOString(),
                  is_active: true,
                  metadata: {
                    query_type: "assistant_query",
                    session_id: data.data.session_id,
                    workflow_type: "default",
                  },
                };
                addSession(newSession);
              }

              // Handle detailed_formatting_complete update_type
              if (data.update_type === "detailed_formatting_complete") {
                if (detailed_formatted_result && message_id) {
                  setDetailedFormattedResult(
                    message_id,
                    detailed_formatted_result
                  );
                }
                if (detailed_raw_result && message_id) {
                  setDetailedRawResult(message_id, detailed_raw_result);
                }
                if (chart_suggestions && message_id) {
                  setChartSuggestions(message_id, chart_suggestions);
                }
              }

              if (message) {
                updateProgressMap(message_id, message);
              }
              if (step === "waiting_filters" && filters) {
                setFilters(message_id, filters);
                requireFilters(message_id);
              } else if (step === "complete") {
                setPending(false);
                completeQuery(message_id);
              }
              break;
            }
            case "query_completed": {
              if (!!message === true) {
                addMessage("tool", message, message_id);
              }
              setPending(false);
              setThinkingEndTime(message_id, new Date());
              completeQuery(message_id);
              break;
            }
            default:
              break;
          }
        },
      });

      clientRef.current = client;
      try {
        await client.connect();
        setIsConnecting(false);
      } catch (err) {
        console.error("Failed to connect to websocket server", err);
        setIsConnecting(false);
      }
    },
    [
      serverUrl,
      setStatus,
      updateProgressMap,
      updateMessageContent,
      setPending,
      setThinkingEndTime,
      setFilters,
      setSessionsData,
      addSession,
      completeQuery,
      requireFilters,
      setChartSuggestions,
      setRawResult,
    ]
  );

  // Auto connect
  useEffect(() => {
    if (!userId) return;
    const sessionId = uuidv4();

    setSessionId(sessionId);
    if (autoConnect) {
      void connect(sessionId, userId);
    }

    return () => {
      clientRef.current?.disconnect();
    };
  }, [autoConnect, connect, setSessionId, userId]);

  /**
   * Send a user query to the server.
   */
  const sendQuery = useCallback(
    async (query: string, messageId: string): Promise<void> => {
      if (!clientRef.current) {
        await connect(sessionId, userId);
      }

      const client = clientRef.current;
      if (!client) throw new Error("WebSocket client not connected");

      setPending(true);
      setThinkingStartTime(messageId);
      client.send({
        type: "query",
        message_id: messageId,
        content: query,
        data: {
          session_id: sessionId,
          user_id: userId,
        },
      });
    },
    [connect, addMessage, setPending, setThinkingStartTime, sessionId, userId]
  );

  /**
   * Cancel the in-flight request.
   */
  const cancelRequest = useCallback(() => {
    clientRef.current?.send({
      type: "cancel",
      data: {
        session_id: sessionId,
        user_id: userId,
      },
    });
    setPending(false);
  }, [setPending, sessionId, userId]);

  /**
   * Send filter response to the server.
   */
  const sendFilterResponse = useCallback(
    (filterValues: Record<string, string>): void => {
      const client = clientRef.current;
      if (!client) throw new Error("WebSocket client not connected");

      // Generate a new message ID for the filter response message
      const filterMessageId = uuidv4();

      // Format the filter values into a readable message
      const filterContent = Object.entries(filterValues)
        .map(([key, value]) => `${key}: ${value}\n`)
        .join(", ");

      // Add a user message showing the filter values
      addMessage("user", `Applied filters: ${filterContent}`, filterMessageId);

      client.send({
        type: "query",
        content: filterValues,
        message_id: filterMessageId,
        data: {
          session_id: sessionId,
          user_id: userId,
        },
      });
    },
    [sessionId, userId, addMessage]
  );

  /**
   * Get chat history for a specific session.
   */
  const getChatHistory = useCallback(
    (targetSessionId: string): void => {
      const client = clientRef.current;
      if (!client) throw new Error("WebSocket client not connected");

      client.send({
        type: "get_chat_history",
        data: {
          session_id: targetSessionId,
          user_id: userId,
        },
      });
    },
    [userId]
  );

  return {
    isConnecting,
    sendQuery,
    cancelRequest,
    sendFilterResponse,
    getChatHistory,
  } as const;
}
