import React, { useState, useEffect } from "react";
import { Filter } from "@/store/types";
import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { SearchableEnumPicker } from "./ui/SearchableEnumPicker";
import { DatePicker } from "./ui/DatePicker";

interface FilterInputProps {
  filters: Filter[];
  messageId: string;
  onSubmit: (filterValues: Record<string, string>) => void;
  onClose?: () => void;
}

const FILTER_MAPPINGS = {
  investment: {
    dataSource: "assets",
    valueField: "name",
    placeholder: "Select investment...",
  },
  fund: {
    dataSource: "funds",
    valueField: "name",
    placeholder: "Select fund...",
  },
} as const;

type FilterMappingKey = keyof typeof FILTER_MAPPINGS;

export const FilterInput = React.memo(function FilterInput({
  filters,
  onSubmit,
}: FilterInputProps) {
  const { businessEntities, selectedItems, clearFilters } = useStore();

  const getInitialFilterValues = () => {
    const initialValues: Record<string, string> = {};

    filters.forEach((filter) => {
      if (filter.name.toLowerCase() === "investment") {
        const selectedAsset = selectedItems.find(
          (item) => item.type === "assets"
        );
        if (selectedAsset) {
          initialValues[filter.name] = selectedAsset.name;
        }
      } else if (filter.name.toLowerCase() === "fund") {
        const selectedAsset = selectedItems.find(
          (item) => item.type === "funds"
        );
        if (selectedAsset) {
          initialValues[filter.name] = selectedAsset.name;
        }
      }
    });

    return initialValues;
  };

  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    getInitialFilterValues()
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const getMappedFilterOptions = (filterName: string): string[] => {
    const normalizedFilterName = filterName.toLowerCase() as FilterMappingKey;
    const mapping = FILTER_MAPPINGS[normalizedFilterName];

    if (!mapping) return [];

    const dataSource =
      businessEntities[mapping.dataSource as keyof typeof businessEntities];
    if (!Array.isArray(dataSource)) return [];

    return dataSource
      .map((item) => {
        if (mapping.valueField === "name") return item.name;
        if (mapping.valueField === "id") return item.id;
        if (mapping.valueField === "type") return item.type;
        return "";
      })
      .filter(Boolean);
  };

  const getMappedFilterPlaceholder = (filterName: string): string => {
    const normalizedFilterName = filterName.toLowerCase() as FilterMappingKey;
    const mapping = FILTER_MAPPINGS[normalizedFilterName];
    return mapping?.placeholder || `Select ${filterName}...`;
  };

  useEffect(() => {
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

    if (validationErrors[filterName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[filterName];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    const missingRequired = filters.filter(
      (filter) => filter.is_required && !filterValues[filter.name]
    );

    if (missingRequired.length > 0) {
      const errors: Record<string, string> = {};
      missingRequired.forEach((filter) => {
        errors[filter.name] = "This field is required";
      });
      setValidationErrors(errors);
      return;
    }

    setIsVisible(false);

    clearFilters();

    setTimeout(() => {
      onSubmit(filterValues);
    }, 300);
  };

  const renderFilterInput = (filter: Filter) => {
    const value = filterValues[filter.name] || "";
    const error = validationErrors[filter.name];

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
              enum_values: mappedOptions,
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
            placeholder={
              hasMappedOptions
                ? getMappedFilterPlaceholder(filter.name)
                : `Enter ${filter.name}...`
            }
            className={`w-full ${
              error ? "border-red-300 focus-visible:ring-red-300" : ""
            }`}
          />
        )}

        {error && <p className="text-sm text-red-300 mt-1">{error}</p>}
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
        <Card className="border-1 shadow-none rounded-b-none border-b-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle
              className={`text-lg flex items-center gap-2 transition-all duration-200 ${
                isAnimating ? "animate-in slide-in-from-top-2" : ""
              }`}
            >
              📋 Filter Required
              <span className="text-sm font-normal text-muted-foreground">
                ({filters.length} filter{filters.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className={`grid gap-4 max-h-60 overflow-y-auto transition-all duration-300 ${
                  isVisible
                    ? "animate-in fade-in-50"
                    : "animate-out fade-out-50"
                }`}
              >
                {filters.map(renderFilterInput)}
              </div>
              <div
                className={`flex justify-end pt-2 transition-all duration-300 delay-100 ${
                  isVisible
                    ? "animate-in slide-in-from-bottom-2"
                    : "animate-out slide-out-to-bottom-2"
                }`}
              >
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
});
