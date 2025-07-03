import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { useStore } from "@/store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Moon, Sun, Plus, Search, MessageSquare } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { SearchChatsModal } from "./SearchChatsModal";
import { useState } from "react";

interface AppSidebarProps {
  onGetChatHistory: (sessionId: string) => void;
}

export function AppSidebar({ onGetChatHistory }: AppSidebarProps) {
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const { sessions, setSessionId, clearMessages } = useStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNewChat = () => {
    // Clear messages and create new session
    clearMessages();
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
  };

  const handleSearchChats = () => {
    setIsSearchModalOpen(true);
  };

  const handleChatSelect = (sessionId: string) => {
    console.log("Session selected:", sessionId);
    // Clear existing messages first
    clearMessages();
    // Set the new session ID
    setSessionId(sessionId);
    // Fetch the chat history for the selected session
    onGetChatHistory(sessionId);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-[60px] items-center justify-between">
            {state === "expanded" && (
              <div className="flex items-center gap-2">
                <img
                  src="/logo.svg"
                  alt="SMC Assistant Logo"
                  className="h-10 w-10 bg-white rounded-md"
                />
                <div>SMC Assistant</div>
              </div>
            )}
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleNewChat}
                    className="w-full justify-start"
                    tooltip="New Chat"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">New Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleSearchChats}
                    className="w-full justify-start"
                    tooltip="Search Chats"
                  >
                    <Search className="h-4 w-4" />
                    <span className="ml-2">Search Chats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Chat History</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {state === "expanded" &&
                  sessions.map((session) => (
                    <SidebarMenuItem key={session.session_id}>
                      <SidebarMenuButton
                        onClick={() => handleChatSelect(session.session_id)}
                        className="w-full justify-start"
                        tooltip={session.title}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="ml-2 truncate">{session.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-[60px] items-center justify-center">
            {state === "expanded" ? (
              <div className="flex items-center gap-2 w-full">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="text-sm">Theme</span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  className="ml-auto scale-90"
                />
              </div>
            ) : (
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                className="scale-75"
              />
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SearchChatsModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        onSelectSession={handleChatSelect}
      />
    </>
  );
}
