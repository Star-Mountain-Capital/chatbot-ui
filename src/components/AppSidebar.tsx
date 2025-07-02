import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
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

// Dummy chat history data
const dummyChatHistory = [
  { id: "1", title: "How to implement authentication" },
  { id: "2", title: "Database optimization strategies" },
  { id: "3", title: "React component best practices" },
  { id: "4", title: "API design patterns" },
  { id: "5", title: "Testing strategies for web apps" },
  { id: "6", title: "Deployment pipeline setup" },
  { id: "7", title: "Performance optimization tips" },
  { id: "8", title: "Security best practices" },
];

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNewChat = () => {
    // TODO: Implement new chat functionality
    console.log("New chat clicked");
  };

  const handleSearchChats = () => {
    // TODO: Implement search chats functionality
    console.log("Search chats clicked");
  };

  const handleChatSelect = (chatId: string) => {
    // TODO: Implement chat selection functionality
    console.log("Chat selected:", chatId);
  };

  return (
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
                dummyChatHistory.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      onClick={() => handleChatSelect(chat.id)}
                      className="w-full justify-start"
                      tooltip={chat.title}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="ml-2 truncate">{chat.title}</span>
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
  );
}
