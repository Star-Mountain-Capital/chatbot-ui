import { ChatPanel } from "./components/ChatPanel";
import { LoadingBanner } from "./components/LoadingBanner";
import { IframeGuard } from "./components/IframeGuard";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { SECURITY_CONFIG } from "./config/security";
import { useStore } from "@/store";
import { useChatLogic } from "./hooks/useChatLogic";

function App() {
  const serverUrl = import.meta.env.VITE_WS_URL || "ws://172.173.148.66:8000/ws"

  // Get chat state from store
  const {
    messages,
    status,
    pending,
    progressMap,
  } = useStore();

  const {
    isConnecting,
    getChatHistory,
    handleSendMessage,
    handleSendFilterResponse,
    cancelRequest,
  } = useChatLogic(serverUrl);

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
