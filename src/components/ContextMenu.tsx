import { Plus, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
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
import useClickOutside from "@/hooks/useClickOutside";

const DUMMY_LISTS = {
  funds: ["Fund A", "Fund B", "Fund C"],
  assets: ["Asset X", "Asset Y", "Asset Z"],
};

interface SelectedItem {
  id: string;
  name: string;
  type: "fund" | "asset";
}

export const ContextMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const dropDownRef = useRef<HTMLDivElement>(null);
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
  useClickOutside(dropDownRef, () => setIsOpen(false));
  const handleItemToggle = (itemName: string, type: "fund" | "asset") => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === `${type}-${itemName}`
      );
      if (existingIndex >= 0) {
        // Remove item if already selected
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add item if not selected
        return [...prev, { id: `${type}-${itemName}`, name: itemName, type }];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const isItemSelected = (itemName: string, type: "fund" | "asset") => {
    return selectedItems.some((item) => item.id === `${type}-${itemName}`);
  };

  const getTypeColor = (type: "fund" | "asset") => {
    return type === "fund"
      ? "bg-green-100 text-green-800"
      : "bg-purple-100 text-purple-800";
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

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Funds</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {DUMMY_LISTS.funds.map((item) => (
                <DropdownMenuCheckboxItem
                  key={item}
                  checked={isItemSelected(item, "fund")}
                  onCheckedChange={() => handleItemToggle(item, "fund")}
                  className="text-sm"
                >
                  {item}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Assets</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {DUMMY_LISTS.assets.map((item) => (
                <DropdownMenuCheckboxItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                  key={item}
                  checked={isItemSelected(item, "asset")}
                  onCheckedChange={() => handleItemToggle(item, "asset")}
                  className="text-sm"
                >
                  {item}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
            item.type
          )}`}
        >
          <span className="text-xs uppercase font-bold mr-1">{item.type}</span>
          {item.name}
          <button
            onClick={() => removeItem(item.id)}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            aria-label={`Remove ${item.name}`}
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
};
