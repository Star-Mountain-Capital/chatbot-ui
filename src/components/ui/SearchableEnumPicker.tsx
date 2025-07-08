import React, { useState } from "react";
import { Filter } from "@/store/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, X, Search } from "lucide-react";

export function SearchableEnumPicker({
  filter,
  value,
  onChange,
  error,
}: {
  filter: Filter;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = filter.enum_values?.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between h-10 px-3 ${error ? "border-red-300 text-red-300" : ""}`}
            type="button"
          >
            <span className="truncate">
              {value || `Select ${filter.name}...`}
            </span>
            <div className="flex items-center gap-1">
              {value && (
                <X
                  className="h-4 w-4 hover:bg-muted rounded p-0.5"
                  onClick={e => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full p-2" align="start">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search options..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(enumValue => (
                <DropdownMenuItem
                  key={enumValue}
                  onClick={() => handleSelect(enumValue)}
                  className="cursor-pointer"
                >
                  {enumValue}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-2 text-center">
                No options found
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 