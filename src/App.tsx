import { ChatPanel } from "./components/ChatPanel";
import { LoadingBanner } from "./components/LoadingBanner";
import { IframeGuard } from "./components/IframeGuard";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { SECURITY_CONFIG } from "./config/security";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/store";
import { useWsClient } from "@/hooks/useWsClient";
import { useEffect } from "react";

function App() {
  const serverUrl = import.meta.env.VITE_WS_URL || "ws://172.173.148.66:8000/ws"

  // Get chat state from store
  const {
    messages,
    status,
    pending,
    progressMap,
    addMessage,
    fetchBusinessEntities,
  } = useStore();

  const { isConnecting, sendQuery, cancelRequest, sendFilterResponse, getChatHistory } =
    useWsClient({
      serverUrl,
      autoConnect: true,
    });

  // Fetch business entities on app load
  useEffect(() => {
    fetchBusinessEntities();
  }, [fetchBusinessEntities]);

  const handleSendMessage = async (message: string) => {
    const messageId = uuidv4();
    addMessage("user", message, messageId);

    try {
      await sendQuery(message, messageId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendFilterResponse = (
    filterValues: Record<string, string>
  ) => {
    try {
      sendFilterResponse(filterValues);
    } catch (error) {
      console.error("Failed to send filter response:", error);
    }
  };

  return (
    <IframeGuard allowedDomain={SECURITY_CONFIG.ALLOWED_IFRAME_DOMAIN}>
      <SidebarProvider>
        <div className="flex h-screen bg-background text-foreground w-full">
          <LoadingBanner isVisible={isConnecting} />

          <AppSidebar onGetChatHistory={getChatHistory} />

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
