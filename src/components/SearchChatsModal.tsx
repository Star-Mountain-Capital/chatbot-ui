import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Calendar, Clock, X } from "lucide-react";
import { useStore } from "@/store";
import { Button } from "./ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Session } from "@/store/types";

interface SearchChatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSession: (sessionId: string) => void;
}

export function SearchChatsModal({
  open,
  onOpenChange,
  onSelectSession,
}: SearchChatsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Session[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { sessions, userId } = useStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch('http://172.173.148.66:8000/search/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            user_id: userId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || data.sessions || data);
        } else {
          console.error('Search request failed:', response.statusText);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error performing search:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [userId]
  );

  // Debounce effect for search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debouncedSearch]);

  // Use search results if available, otherwise show recent sessions
  const displaySessions = searchTerm.trim() 
    ? searchResults 
    : sessions.slice(0, 10);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSearchResults([]);
    }
  }, [open]);

  const handleSelectSession = (sessionId: string) => {
    onSelectSession(sessionId);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-fit p-0 w-[30%]" hideClose>
        <div className="flex items-center justify-between gap-4 px-2 pt-2">
          <div className="flex items-center gap-2 flex-1">
            <Search className={`h-4 w-4 text-muted-foreground ${isSearching ? 'animate-spin' : ''}`} />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-none focus-visible:ring-0 text-lg bg-transparent"
            />
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="w-full h-[1px] bg-sidebar-border">
          <Separator />
        </div>

        <div className="h-[400px] overflow-y-auto theme-scrollbar">
          {displaySessions.length > 0 ? (
            <div className="space-y-2 px-2">
              {displaySessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => handleSelectSession(session.session_id)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {session.title}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(session.created_at)}</span>
                        {session.is_active && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm.trim() === ""
                  ? "Start typing to search your chats"
                  : isSearching
                  ? "Searching..."
                  : `No chats found matching "${searchTerm}"`}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
