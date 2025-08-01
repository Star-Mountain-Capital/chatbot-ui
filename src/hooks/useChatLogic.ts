import { useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/store";
import { useWsClient } from "@/hooks/useWsClient";
import {
  getUserIdFromUrl,
  isDevelopmentMode,
} from "@/config/security";

export function useChatLogic(serverUrl: string) {
  const { addMessage, fetchBusinessEntities, setUserId } = useStore();

  const {
    isConnecting,
    sendQuery,
    cancelRequest,
    sendFilterResponse,
    sendConfirmationResponse,
    getChatHistory,
  } = useWsClient({
    serverUrl,
    autoConnect: true,
  });

  // Validate userId from URL when not in dev mode
  useEffect(() => {
    try {
      if (isDevelopmentMode()) {
        setUserId("b23461ed-b833-40c7-af8c-952e2ad06740");
      } else {
        const userId = getUserIdFromUrl();
        if (userId) {
          setUserId(userId);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, [setUserId]);

  // Fetch business entities on app load
  useEffect(() => {
    fetchBusinessEntities();
  }, [fetchBusinessEntities]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      const messageId = uuidv4();
      addMessage("user", message, messageId);
      try {
        await sendQuery(message, messageId);
      } catch (error) {
        console.error(error);
      }
    },
    [addMessage, sendQuery]
  );

  const handleSendFilterResponse = useCallback(
    (filterValues: Record<string, string>) => {
      try {
        sendFilterResponse(filterValues);
      } catch (error) {
        console.error("Failed to send filter response:", error);
      }
    },
    [sendFilterResponse]
  );

  const handleSendConfirmationResponse = useCallback(
    (messageId: string, confirmationMessage: string) => {
      try {
        sendConfirmationResponse(messageId, confirmationMessage);
      } catch (error) {
        console.error("Failed to send confirmation response:", error);
      }
    },
    [sendConfirmationResponse]
  );

  return {
    isConnecting,
    getChatHistory,
    handleSendMessage,
    handleSendFilterResponse,
    handleSendConfirmationResponse,
    cancelRequest,
  };
}
