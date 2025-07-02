import { ChatPanel } from "./components/ChatPanel";
import { LoadingBanner } from "./components/LoadingBanner";
import { IframeGuard } from "./components/IframeGuard";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { isDevelopmentMode, SECURITY_CONFIG } from "./config/security";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/store";
import { useWsClient } from "@/hooks/useWsClient";
import { useEffect } from "react";

function App() {
  const serverUrl = isDevelopmentMode()
    ? "ws://172.173.148.66:8000/ws"
    : "wss://chatbot.smc.soallabs.com/ws";

  // Get chat state from store
  const { messages, status, pending, progressMap, addMessage, setSessionId, setUserId } = useStore();

  const { isConnecting, sendQuery, cancelRequest, sendFilterResponse } = useWsClient({
    serverUrl,
    autoConnect: true,
  });

  // Initialize sessionId and userId on component mount
  useEffect(() => {
    const sessionId = uuidv4();
    const userId = uuidv4();
    
    setSessionId(sessionId);
    setUserId(userId);
    
  }, [setSessionId, setUserId]);

  const handleSendMessage = async (message: string) => {
    const messageId = uuidv4();
    addMessage("user", message, messageId);
    try {
      await sendQuery(message, messageId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendFilterResponse = (messageId: string, filterValues: Record<string, string>) => {
    try {
      sendFilterResponse(messageId, filterValues);
    } catch (error) {
      console.error("Failed to send filter response:", error);
    }
  };

  return (
    <IframeGuard allowedDomain={SECURITY_CONFIG.ALLOWED_IFRAME_DOMAIN}>
      <SidebarProvider>
        <div className="flex h-screen bg-background text-foreground w-full">
          <LoadingBanner isVisible={isConnecting} />

          <AppSidebar />

          <SidebarInset>
            <ChatPanel
              messages={messages}
              connectionStatus={status}
              hasActiveRequest={pending}
              progressMap={progressMap}
              onCancelRequest={cancelRequest}
              onSendMessage={handleSendMessage}
              onSendFilterResponse={handleSendFilterResponse}
            />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </IframeGuard>
  );
}

export default App;
