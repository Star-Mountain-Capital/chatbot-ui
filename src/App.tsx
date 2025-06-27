import { useMCP } from "@/hooks/useMCP";
import { useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { SettingsDialog } from "./components/SettingsDialog";
import { LoadingBanner } from "./components/LoadingBanner";
import { IframeGuard } from "./components/IframeGuard";
import { isDevelopmentMode, SECURITY_CONFIG } from "./config/security";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/store";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState(
    isDevelopmentMode()
      ? "https://obliging-arguably-raven.ngrok-free.app/sse"
      : "https://chatbot.smc.soallabs.com/sse"
  );

  // Get chat state from store
  const { messages, status, pending, progressMap, addMessage } = useStore();

  const { isConnecting, sendQuery, disconnect, clearMessages, cancelRequest } =
    useMCP({
      serverUrl,
      autoConnect: true,
    });

  const handleSendMessage = async (message: string) => {
    const messageId = uuidv4();
    addMessage("user", message, messageId);
    try {
      await sendQuery(message, messageId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <IframeGuard allowedDomain={SECURITY_CONFIG.ALLOWED_IFRAME_DOMAIN}>
      <div className="flex h-screen bg-background text-foreground">
        <LoadingBanner isVisible={isConnecting} />

        <div className="w-full border-r flex flex-col h-full">
          <ChatPanel
            messages={messages}
            connectionStatus={status}
            hasActiveRequest={pending}
            progressMap={progressMap}
            onClearChat={clearMessages}
            onCancelRequest={cancelRequest}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>

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
