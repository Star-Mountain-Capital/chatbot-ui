import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { WsClient } from "@/lib/wsClient";
import { Filter } from "@/store/types";
import { v4 as uuidv4 } from "uuid";

interface UseWsClientOptions {
  serverUrl: string;
  autoConnect?: boolean;
}

interface ProgressPayload {
  type: string;
  data?: {
    message_id: string;
    message?: string;
    step?: string;
    filters?: Filter[];
  };
  result?: {
    message_id: string;
    message?: string;
    step?: string;
    filters?: Filter[];
  };
  content?: string;
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
  } = useStore();

  const [isConnecting, setIsConnecting] = useState(false);

  const clientRef = useRef<WsClient | null>(null);

  /**
   * Establish a WebSocket connection using WsClient.
   */
  const connect = useCallback(async () => {
    if (clientRef.current) return; // Already connected

    setIsConnecting(true);

    const client = new WsClient({
      serverUrl,
      onStatusChange: (status) => {
        setStatus(status);
        if (status !== "connected") {
          setIsConnecting(false);
        }
      },
      onProgress: (payload: unknown) => {
        if (typeof payload !== "object" || payload === null) return;
        
        const data = payload as ProgressPayload;
        const type = data.type;
        let message_id, message, step, filters;
        if (data.data) {
            ({ message_id, message, step, filters } = data.data);
        } else if (data.result) {
            ({ message_id, message, step, filters } = data.result);
        }
        if (!message_id) return;

        switch (type) {
          case "progress": {
            if (message) {
              updateProgressMap(message_id, message);
            }
            if (step === "waiting_filters" && filters) {
              setFilters(message_id, filters);
            }else if (step === "complete") {
                setPending(false);
            }
            break;
          }
          case "query_completed": {
            if (message !== undefined) {
              addMessage("tool", message, message_id);
            }
            setPending(false);
            setThinkingEndTime(message_id, new Date());
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
  }, [
    serverUrl,
    setStatus,
    updateProgressMap,
    updateMessageContent,
    setPending,
    setThinkingEndTime,
    setFilters,
  ]);

  // Auto connect
  useEffect(() => {
    if (autoConnect) {
      void connect();
    }

    return () => {
      clientRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, connect]);

  /**
   * Send a user query to the server.
   */
  const sendQuery = useCallback(
    async (query: string, messageId: string): Promise<void> => {
      if (!clientRef.current) {
        await connect();
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
    (messageId: string, filterValues: Record<string, string>): void => {
      const client = clientRef.current;
      if (!client) throw new Error("WebSocket client not connected");

      // Generate a new message ID for the filter response message
      const filterMessageId = uuidv4();
      
      // Format the filter values into a readable message
      const filterContent = Object.entries(filterValues)
        .map(([key, value]) => `${key}: ${value}\n`)
        .join(', ');
      
      // Add a user message showing the filter values
      addMessage("user", `Applied filters: ${filterContent}`, filterMessageId);

      client.send({
        type: "query",
        content: filterValues,
        message_id: filterMessageId,
        data:{
            session_id: sessionId,
            user_id: userId,
        }
      });
    },
    [sessionId, userId, addMessage]
  );

  return {
    isConnecting,
    sendQuery,
    cancelRequest,
    sendFilterResponse,
  } as const;
}
