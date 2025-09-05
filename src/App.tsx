import { SquarePenIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { v4 as uuidv4 } from 'uuid';

import { AppSidebar } from '@/components/AppSidebar';
import ChatPanel from '@/components/ChatPanel';
import { IframeGuard } from '@/components/IframeGuard';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { getUserIdFromUrl, SECURITY_CONFIG } from '@/config/security';
import { useWsClient } from '@/hooks/useWsClient';
import { cn } from '@/lib';
import { useStore } from '@/store';

interface BusinessEntity {
  id: string;
  name: string;
}

const App = () => {
  const {
    getChatHistory,
    isConnecting,
    sendConfirmationResponse,
    sendFilterResponse,
    sendQuery
  } = useWsClient({
    autoConnect: true,
    serverUrl: import.meta.env.VITE_WS_URL
  });

  const {
    addMessage,
    clearMessages,
    messages,
    sessionId,
    sessions,
    setBusinessEntities,
    setQuestions,
    setSessionId,
    setUserId
  } = useStore();

  const [isFetching, setIsFetching] = useState(true);
  const [showHardCodedData, setShowHardCodedData] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/business-entities`
      );

      const entities = (await response.json()) as {
        assets: BusinessEntity[];
        funds: BusinessEntity[];
      };

      const ALLOWED_FUNDS = [
        'Fund II',
        'Fund III',
        'Fund IV',
        'Fund V',
        'Fund II-A',
        'SBIC',
        'BDC'
      ];

      setBusinessEntities({
        assets: entities.assets,
        funds: entities.funds.filter(el => ALLOWED_FUNDS.includes(el.name))
      });

      setIsFetching(false);
    })();
  }, [setBusinessEntities]);

  const [sidebarIsOpen, setSidebarIsOpen] = useLocalStorageState(
    'sidebarIsOpen',
    {
      defaultValue: true
    }
  );

  useEffect(() => {
    try {
      if (import.meta.env.DEV) {
        setUserId('b23461ed-b833-40c7-af8c-952e2ad06740');
      } else {
        const userId = getUserIdFromUrl();
        if (userId) {
          setUserId(userId);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [setUserId]);

  const currentSession = sessions.find(
    session => session.session_id === sessionId
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      const messageId = uuidv4();
      addMessage('user', message, messageId);
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
        console.error('Failed to send filter response:', error);
      }
    },
    [sendFilterResponse]
  );

  const handleSendConfirmationResponse = useCallback(
    (messageId: string, confirmationMessage: string) => {
      try {
        sendConfirmationResponse(messageId, confirmationMessage);
      } catch (error) {
        console.error('Failed to send confirmation response:', error);
      }
    },
    [sendConfirmationResponse]
  );

  if (isConnecting || isFetching) return null;

  return (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <IframeGuard allowedDomain={SECURITY_CONFIG.ALLOWED_IFRAME_DOMAIN}>
        <SidebarProvider
          onOpenChange={setSidebarIsOpen}
          open={sidebarIsOpen}
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)'
            } as React.CSSProperties
          }
        >
          <AppSidebar
            getChatHistory={getChatHistory}
            setShowHardCodedData={setShowHardCodedData}
            showHardCodedData={showHardCodedData}
            variant="inset"
          />
          <SidebarInset
            className={cn(
              'min-w-0 shadow-sm',
              messages.length === 0
                ? 'bg-[image:linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]'
                : 'bg-[image:linear-gradient(180deg,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0)_100%)]'
            )}
          >
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
              <div className="flex w-full items-center gap-1 gap-x-2 px-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarTrigger />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{sidebarIsOpen ? 'Close Sidebar' : 'Open Sidebar'}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="size-7"
                      onClick={() => {
                        clearMessages();
                        setSessionId(uuidv4());
                        setQuestions([]);
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <SquarePenIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New Chat</p>
                  </TooltipContent>
                </Tooltip>
                {messages.length !== 0 &&
                  (currentSession !== undefined ? (
                    <div className="text-sm">{currentSession.title}</div>
                  ) : (
                    <Skeleton className="h-5 w-[200px]" />
                  ))}
              </div>
            </header>
            <ChatPanel
              handleSendMessage={message => {
                void handleSendMessage(message);
              }}
              messages={messages}
              showHardCodedData={showHardCodedData}
            />
          </SidebarInset>
        </SidebarProvider>
      </IframeGuard>
    </ThemeProvider>
  );
};

export default App;
