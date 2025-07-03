import { useState, useEffect } from "react";
import { Filter } from "@/store/types";
import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Send, Search, X, CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

interface FilterInputProps {
  filters: Filter[];
  messageId: string;
  onSubmit: (filterValues: Record<string, string>) => void;
  onClose?: () => void;
}

// Searchable Enum Picker Component
function SearchableEnumPicker({ 
  filter, 
  value, 
  onChange, 
  error 
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
            className={`w-full justify-between h-10 px-3 ${
              error ? "border-red-300 text-red-300" : ""
            }`}
            type="button"
          >
            <span className="truncate">
              {value || `Select ${filter.name}...`}
            </span>
            <div className="flex items-center gap-1">
              {value && (
                <X 
                  className="h-4 w-4 hover:bg-muted rounded p-0.5" 
                  onClick={(e) => {
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((enumValue) => (
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

// Enhanced Date Picker Component
function DatePicker({ 
  value, 
  onChange, 
  error 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  error?: string; 
}) {
  const [open, setOpen] = useState(false);
  
  // Convert string date to Date object
  const selectedDate = value ? new Date(value) : undefined;
  
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Format date as YYYY-MM-DD for consistency
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${
            error ? "border-red-300 text-red-300" : ""
          } ${!value && "text-muted-foreground"}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(selectedDate!, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// Filter mapping configuration - easily extensible for new filter types
const FILTER_MAPPINGS = {
  investment: {
    dataSource: 'assets',
    valueField: 'name',
    placeholder: 'Select investment...'
  },
} as const;

type FilterMappingKey = keyof typeof FILTER_MAPPINGS;

export function FilterInput({
  filters,
  onSubmit,
}: FilterInputProps) {
  const {businessEntities, selectedItems} = useStore();
  console.log(selectedItems)
  
  // Initialize filter values with defaults from selectedItems
  const getInitialFilterValues = () => {
    const initialValues: Record<string, string> = {};
    
    filters.forEach(filter => {
      if (filter.name.toLowerCase() === 'investment') {
        // Check if there's an asset in selectedItems
        const selectedAsset = selectedItems.find(item => item.type === 'assets');
        if (selectedAsset) {
          initialValues[filter.name] = selectedAsset.name;
        }
      }
    });
    
    return initialValues;
  };
  
  const [filterValues, setFilterValues] = useState<Record<string, string>>(getInitialFilterValues());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
console.log(filters)

  // Helper function to get options for mapped filters
  const getMappedFilterOptions = (filterName: string): string[] => {
    const normalizedFilterName = filterName.toLowerCase() as FilterMappingKey;
    const mapping = FILTER_MAPPINGS[normalizedFilterName];
    
    if (!mapping) return [];
    
    const dataSource = businessEntities[mapping.dataSource as keyof typeof businessEntities];
    if (!Array.isArray(dataSource)) return [];
    
    return dataSource.map((item) => {
      // Handle known fields from BusinessEntity
      if (mapping.valueField === 'name') return item.name;
      if (mapping.valueField === 'id') return item.id;
      if (mapping.valueField === 'type') return item.type;
      return '';
    }).filter(Boolean);
  };

  // Helper function to get placeholder for mapped filters
  const getMappedFilterPlaceholder = (filterName: string): string => {
    const normalizedFilterName = filterName.toLowerCase() as FilterMappingKey;
    const mapping = FILTER_MAPPINGS[normalizedFilterName];
    return mapping?.placeholder || `Select ${filterName}...`;
  };
  // Animation effect when component mounts
  useEffect(() => {
    // Small delay to ensure smooth animation
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (filterName: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[filterName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[filterName];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Check if all required filters have values
    const missingRequired = filters.filter(
      (filter) => filter.is_required && !filterValues[filter.name]
    );

    if (missingRequired.length > 0) {
      // Set validation errors for missing required fields
      const errors: Record<string, string> = {};
      missingRequired.forEach((filter) => {
        errors[filter.name] = "This field is required";
      });
      setValidationErrors(errors);
      return;
    }

    // Start closing animation
    setIsVisible(false);
    
    // Wait for animation to complete before submitting
    setTimeout(() => {
      onSubmit(filterValues);
    }, 300);
  };

  const renderFilterInput = (filter: Filter) => {
    const value = filterValues[filter.name] || "";
    const error = validationErrors[filter.name];

    // Determine filter type
    const filterType = filter.type.toLowerCase();
    const isEnum = filter.enum_values && filter.enum_values.length > 0;
    const isDate = filterType === "date" || filter.format === "date";
    
    // Check if this filter has a mapping to business entities data
    const mappedOptions = getMappedFilterOptions(filter.name);
    const hasMappedOptions = mappedOptions.length > 0;

    return (
      <div key={filter.name} className="space-y-2">
        <Label htmlFor={filter.name} className="text-sm font-medium">
          {filter.name}
          {filter.is_required && <span className="text-red-300 ml-1">*</span>}
        </Label>
        
        {hasMappedOptions ? (
          <SearchableEnumPicker
            filter={{
              ...filter,
              enum_values: mappedOptions
            }}
            value={value}
            onChange={(newValue) => handleInputChange(filter.name, newValue)}
            error={error}
          />
        ) : isEnum ? (
          <SearchableEnumPicker
            filter={filter}
            value={value}
            onChange={(newValue) => handleInputChange(filter.name, newValue)}
            error={error}
          />
        ) : isDate ? (
          <DatePicker
            value={value}
            onChange={(newValue) => handleInputChange(filter.name, newValue)}
            error={error}
          />
        ) : (
          <Input
            id={filter.name}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(filter.name, e.target.value)}
            placeholder={hasMappedOptions ? getMappedFilterPlaceholder(filter.name) : `Enter ${filter.name}...`}
            className={`w-full ${
              error ? "border-red-300 focus-visible:ring-red-300" : ""
            }`}
          />
        )}
        
        {error && (
          <p className="text-sm text-red-300 mt-1">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="absolute bottom-full left-0 right-0 z-40 translate-y-6">
      <div
        className={`transform transition-all duration-300 ease-in-out ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-95"
        }`}
      >
        <Card className="border-1 rounded-b-none shadow-lg border-b-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className={`text-lg flex items-center gap-2 transition-all duration-200 ${
              isAnimating ? "animate-in slide-in-from-top-2" : ""
            }`}>
              📋 Filter Required
              <span className="text-sm font-normal text-muted-foreground">
                ({filters.length} filter{filters.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`grid gap-4 max-h-60 overflow-y-auto transition-all duration-300 ${
                isVisible ? "animate-in fade-in-50" : "animate-out fade-out-50"
              }`}>
                {filters.map(renderFilterInput)}
              </div>
              <div className={`flex justify-end pt-2 transition-all duration-300 delay-100 ${
                isVisible ? "animate-in slide-in-from-bottom-2" : "animate-out slide-out-to-bottom-2"
              }`}>
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  className="flex items-center gap-2 transition-all duration-200 hover:scale-105" 
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
