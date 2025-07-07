import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import useClickOutside from "@/hooks/useClickOutside";
import { useStore } from "@/store";
import { Plus, X, Search } from "lucide-react";

export const ContextMenu: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const dropDownRef = useRef<HTMLDivElement>(null);
  const searchInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const { 
    businessEntities, 
    isLoading, 
    selectedItems, 
    toggleSelectedItem, 
    removeSelectedItem 
  } = useStore();

  // Group business entities by type and filter by search term for each type
  const groupedEntities = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for(const key of Object.keys(businessEntities)) {
      const searchTerm = searchTerms[key] || "";
      const filteredEntities = businessEntities[key]
        .filter((entity) => 
          entity.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((entity) => entity.name);
      
      groups[key] = filteredEntities;
    }
    return groups;
  }, [businessEntities, searchTerms]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (isOpen && e.key.toLowerCase() === "escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [isOpen]);

  useClickOutside(dropDownRef, () => {
    setIsOpen(false);
    setSearchTerms({}); // Clear all search terms when closing
  });

  const isItemSelected = (itemName: string, type: string) => {
    return selectedItems.some((item) => item.id === `${type}-${itemName}`);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fund: "bg-green-100 text-green-800",
      asset: "bg-purple-100 text-purple-800",
      // Add more colors for different types as needed
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleSearchChange = (type: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [type]: value }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent, type: string) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      // Remove focus from search input to allow menu navigation
      const searchInput = searchInputRefs.current[type];
      if (searchInput) {
        searchInput.blur();
      }
      // Focus the first/last menu item
      setTimeout(() => {
        const menuItems = document.querySelectorAll('[role="menuitemcheckbox"]');
        if (menuItems.length > 0) {
          if (e.key === 'ArrowDown') {
            (menuItems[0] as HTMLElement).focus();
          } else {
            (menuItems[menuItems.length - 1] as HTMLElement).focus();
          }
        }
      }, 10);
    }
  };

  const handleSubMenuOpen = (type: string) => {
    // Auto-focus search input when submenu opens
    setTimeout(() => {
      const searchInput = searchInputRefs.current[type];
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const renderSubMenuContent = (type: string, items: string[]) => {
    const searchTerm = searchTerms[type] || "";
    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <DropdownMenuSubContent 
        className="max-h-64 overflow-y-auto w-64"
      >
        {/* Search Bar */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              ref={(el) => {
                if (el) {
                  searchInputRefs.current[type] = el;
                }
              }}
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(type, e.target.value)}
              className="pl-8 h-8 text-sm"
              onKeyDown={(e) => handleSearchKeyDown(e, type)}
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable Items */}
        <div className="max-h-48 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">
              {searchTerm ? "No matches found" : "No items available"}
            </div>
          ) : (
            filteredItems.map((item: string) => (
                              <DropdownMenuCheckboxItem
                  key={item}
                  checked={isItemSelected(item, type)}
                  onCheckedChange={() => toggleSelectedItem(item, type)}
                  className="text-sm"
                onKeyDown={(e) => {
                  // Allow typing to go back to search
                  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    const searchInput = searchInputRefs.current[type];
                    if (searchInput) {
                      searchInput.focus();
                      // Add the typed character to the search
                      const currentValue = searchTerms[type] || "";
                      handleSearchChange(type, currentValue + e.key);
                    }
                  }
                }}
              >
                {item}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </div>
      </DropdownMenuSubContent>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Open menu"
            className="h-6 w-6 rounded-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            tabIndex={0}
            onClick={() => setIsOpen(true)}
          >
            <Plus size={15} strokeWidth={3} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" side="top" ref={dropDownRef}>
          <DropdownMenuLabel>Add Context</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Scrollable Content */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : Object.keys(groupedEntities).length === 0 ? (
              <div className="p-2 text-sm text-gray-500">No entities available</div>
            ) : (
              Object.entries(groupedEntities).map(([type, items]) => (
                <DropdownMenuSub 
                  key={type}
                  onOpenChange={(isOpen) => {
                    if (isOpen) {
                      handleSubMenuOpen(type);
                    }
                  }}
                >
                  <DropdownMenuSubTrigger className="capitalize">
                    {type} ({items.length})
                  </DropdownMenuSubTrigger>
                  {renderSubMenuContent(type, items)}
                </DropdownMenuSub>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}
        >
          <span className="text-xs uppercase font-bold mr-1">{item.type}</span>
          {item.name}
          <button
            onClick={() => removeSelectedItem(item.id)}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            aria-label={`Remove ${item.name}`}
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
});
