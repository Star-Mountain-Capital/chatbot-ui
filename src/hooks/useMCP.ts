import { ChatMessageProps, MessageRole } from "@/components/ChatMessage";
import { McpClient, Options, Status } from "@/lib/client";
import { ServerNotification } from "@modelcontextprotocol/sdk/types.js";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseMcpClientOptions
  extends Omit<Options, "onProgress" | "onStatusChange"> {
  autoConnect?: boolean;
}

const initMessage = {
  role: "tool" as MessageRole,
  content: "Hello, how can i help?",
  timestamp: new Date(),
};

type NotifData = {
  screenshot: string;
  result: string;
};

export function useMCP(options: UseMcpClientOptions) {
  const clientRef = useRef<McpClient | null>(null);

  const [pending, setPending] = useState(false);
  const [image, setImage] = useState<undefined | string>();
  const [status, setStatus] = useState<Status>("disconnected");
  const [messages, setMessages] = useState<ChatMessageProps[]>([initMessage]);

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
  }, [options.serverUrl]); // Only re-initialize when serverUrl changes

  // handle agent callback
  const handleProgress = useCallback((notif: ServerNotification) => {
    console.log(notif);
    if (notif.method === "notifications/message") {
      const { screenshot, result } = notif.params.data as NotifData;
      addMessage("tool", result);
      setImage(screenshot);
      setPending(false);
    }
  }, []);

  const addMessage = (role: MessageRole, content: string) => {
    console.log(messages)
    setMessages((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  // Connect to server
  const connect = useCallback(async () => {
    if (!clientRef.current) return;
    try {
      await clientRef.current.connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  }, []);

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
  const sendQuery = async (message: string) => {
    setPending(true);
    return await clientRef.current?.callTool("perform_search", {
      task: message,
    });
  };

  // Cancel the current request
  const cancelRequest = async () => {
    await clientRef.current?.callTool("stop_search", {});
    setPending(false);
  };

  // clearMessages
  const clearMessages = async() => {
     await clientRef.current?.callTool("clear_session_messages", {});
    setMessages([initMessage]);
  }

  return {
    image,
    status,
    pending,
    connect,
    messages,
    sendQuery,
    addMessage,
    disconnect,
    clearMessages,
    cancelRequest,
  };
}
