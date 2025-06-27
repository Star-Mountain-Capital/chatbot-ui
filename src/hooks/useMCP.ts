import { McpClient, Options } from "@/lib/client";
import { ServerNotification } from "@modelcontextprotocol/sdk/types.js";
import { useCallback, useEffect, useRef } from "react";
import { useStore } from "@/store";
import { v4 as uuidv4 } from "uuid";

interface UseMcpClientOptions
  extends Omit<Options, "onProgress" | "onStatusChange"> {
  autoConnect?: boolean;
}
interface NotifData {
  result: string;
  is_progress: boolean;
  message_id: string;
}

export function useMCP(options: UseMcpClientOptions) {
  const clientRef = useRef<McpClient | null>(null);

  // Get state and actions from store
  const {
    pending,
    status,
    messages,
    isConnecting,
    progressMap,
    setPending,
    setStatus,
    setIsConnecting,
    addMessage,
    clearMessages,
    updateProgressMap,
    setThinkingEndTime,
    setThinkingStartTime,
    updateMessageContent,
  } = useStore();

  // Connect to server
  const connect = useCallback(async () => {
    if (!clientRef.current) return;
    try {
      setIsConnecting(true);
      await clientRef.current.connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [setIsConnecting]);

  // Initialize client
  useEffect(() => {
    clientRef.current = new McpClient({
      ...options,
      onStatusChange: setStatus,
      onProgress: handleProgress,
    });
    return () => {
      if (clientRef.current && status === "connected")
        clientRef.current.disconnect().catch(console.error);
    };
  }, [options.serverUrl, setStatus]); // Only re-initialize when serverUrl changes

  // Auto-connect when component mounts and serverUrl is available
  useEffect(() => {
    if (options.autoConnect && clientRef.current && status === "disconnected") {
      connect();
    }
  }, [options.autoConnect, status, connect]);

  // handle agent callback
  const handleProgress = useCallback(
    (notif: ServerNotification) => {
      if (notif.method === "notifications/message") {
        const { result, is_progress, message_id } = notif.params
          .data as NotifData;
        if (is_progress) {
          updateProgressMap(message_id, result);
          setPending(true);
        } else {
          // Update the existing message content
          addMessage("tool", result, uuidv4());
          setPending(false);
          setThinkingEndTime(message_id, new Date());
        }
      }
    },
    [updateProgressMap, setPending, updateMessageContent, setThinkingEndTime]
  );

  // Disconnect from server
  const disconnect = useCallback(async () => {
    if (!clientRef.current) return;
    try {
      await clientRef.current.disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, []);

  // Send request to server using request with AbortController
  const sendQuery = async (message: string, messageId: string) => {
    setPending(true);
    setThinkingStartTime(messageId);
    return await clientRef.current?.callTool("perform_search", {
      task: message,
      messageId,
    });
  };

  // Cancel the current request
  const cancelRequest = async () => {
    await clientRef.current?.callTool("stop_search", {});
    setPending(false);
  };

  // clearMessages
  const clearMessagesHandler = async () => {
    await clientRef.current?.callTool("clear_session_messages", {});
    clearMessages();
  };

  return {
    status,
    pending,
    isConnecting,
    connect,
    messages,
    sendQuery,
    addMessage,
    disconnect,
    clearMessages: clearMessagesHandler,
    cancelRequest,
    progressMap,
  };
}
