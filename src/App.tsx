import { useMCP } from "@/hooks/useMCP";
import { useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { SettingsDialog } from "./components/SettingsDialog";
import { LoadingBanner } from "./components/LoadingBanner";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState("https://chatbot.smc.soallabs.com/sse");

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
  );
}

export default App;
