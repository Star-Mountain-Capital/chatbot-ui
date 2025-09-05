import { FlaskConicalIcon, PenSquareIcon, SearchIcon } from 'lucide-react';
import {
  type ComponentProps,
  type Dispatch,
  type InputHTMLAttributes,
  type SetStateAction,
  useMemo,
  useState
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useStore } from '@/store';

interface Props extends ComponentProps<typeof Sidebar> {
  getChatHistory: (targetSessionId: string) => void;
  setShowHardCodedData: Dispatch<SetStateAction<boolean>>;
  showHardCodedData: boolean;
}

const AppSidebar = ({
  getChatHistory,
  setShowHardCodedData,
  showHardCodedData,
  ...sidebarProps
}: Props) => {
  const { clearMessages, sessions, setQuestions, setSessionId } = useStore();

  const [searchValue, setSearchValue] = useState('');

  const handleNewChatButtonClick = () => {
    clearMessages();
    setSessionId(uuidv4());
    setQuestions([]);
  };

  const handleSidebarMenuButtonClick = (sessionId: string) => () => {
    // Clear existing messages first
    //clearMessages();
    // Set the new session ID
    setSessionId(sessionId);
    // Fetch the chat history for the selected session
    getChatHistory(sessionId);
  };

  const filteredSessions = useMemo(
    () =>
      sessions.filter(session =>
        session.title.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue, sessions]
  );

  const handleSearchChange: InputHTMLAttributes<HTMLInputElement>['onChange'] =
    event => {
      setSearchValue(event.target.value);
    };

  return (
    <Sidebar
      collapsible="offcanvas"
      {...sidebarProps}
    >
      <SidebarHeader>
        <Button
          onClick={handleNewChatButtonClick}
          variant="secondary"
        >
          <PenSquareIcon />
          New Chat
        </Button>
        <div className="relative w-full">
          <SearchIcon
            className="text-muted-foreground absolute top-0 bottom-0 left-3 my-auto"
            size={16}
          />
          <Input
            className="bg-accent dark:bg-input/50 border-none pl-8"
            onChange={handleSearchChange}
            placeholder="Search"
            type="search"
            value={searchValue}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chat History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSessions.map(session => (
                <SidebarMenuItem key={session.title}>
                  <SidebarMenuButton
                    onClick={handleSidebarMenuButtonClick(session.session_id)}
                    tooltip={session.title}
                  >
                    <span>{session.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <img src="/avatar.png" />
            <div className="text-sm leading-none font-semibold">SMC</div>
          </div>
          <div className="flex gap-x-2">
            <Tooltip>
              <TooltipTrigger>
                <Toggle
                  onPressedChange={pressed => {
                    setShowHardCodedData(pressed);
                  }}
                  pressed={showHardCodedData}
                  variant="outline"
                >
                  <FlaskConicalIcon />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {showHardCodedData
                    ? 'Hide hard-coded data'
                    : 'Show hard-coded data'}
                </p>
              </TooltipContent>
            </Tooltip>
            <ModeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
