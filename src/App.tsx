import { useMCP } from "@/hooks/useMCP";
import { useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { SettingsDialog } from "./components/SettingsDialog";
import { LoadingBanner } from "./components/LoadingBanner";
import { IframeGuard } from "./components/IframeGuard";
import { isDevelopmentMode, SECURITY_CONFIG } from "./config/security";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState(isDevelopmentMode() ? "https://obliging-arguably-raven.ngrok-free.app/sse": "https://chatbot.smc.soallabs.com/sse");

  const {
    status,
    pending,
    isConnecting,
    messages,
    sendQuery,
    addMessage,
    disconnect,
    clearMessages,
    cancelRequest,
  } = useMCP({
    serverUrl,
    autoConnect: true,
  });

  const handleSendMessage = async (message: string) => {
    addMessage("user", message);
    try {
      await sendQuery(message);
    } catch (error) {
      addMessage("tool", `Error running the agent ${error}`);
    }
  };

  return (
    <IframeGuard allowedDomain={SECURITY_CONFIG.ALLOWED_IFRAME_DOMAIN}>
      <div className="flex h-screen bg-background text-foreground">
        {/* Loading Banner */}
        <LoadingBanner isVisible={isConnecting} />
        
        {/* Sidebar */}
        <div className="w-full border-r flex flex-col h-full">
          <ChatPanel
            messages={messages}
            connectionStatus={status}
            hasActiveRequest={pending}
            onClearChat={clearMessages}
            onCancelRequest={cancelRequest}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* Settings Dialog */}
        <SettingsDialog
          serverUrl={serverUrl}
          isOpen={isSettingsOpen}
          connectionStatus={status}
          onDisconnect={disconnect}
          onServerUrlChange={setServerUrl}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </IframeGuard>
  );
}

export default App;
