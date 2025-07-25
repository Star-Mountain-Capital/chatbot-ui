import { cn } from "@/lib/utils";
import {
  ChartAreaIcon,
  ChartBarIcon,
  ChartCandlestickIcon,
  ChartLineIcon,
  ChartNoAxesCombinedIcon,
  ChartPieIcon,
  ChartScatterIcon,
  WandSparkles,
  Check,
  Loader2,
} from "lucide-react";
import { marked } from "marked";

export type MessageRole = "user" | "tool";

export interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
  loading?: boolean;
  progressSteps: string[];
  messageId: string;
  thinkingEndTime?: Date;
  thinkingStartTime?: Date;
  pending?: boolean;
}

import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { markdownTable } from "markdown-table";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useStore } from "@/store";
import { Button } from "./ui/button";
import ChartRenderer from "./ChartRenderer";

const IconMap: Record<string, React.ReactNode> = {
  bar: <ChartBarIcon className="w-4 h-4" />,
  line: <ChartLineIcon className="w-4 h-4" />,
  pie: <ChartPieIcon className="w-4 h-4" />,
  area: <ChartAreaIcon className="w-4 h-4" />,
  scatter: <ChartScatterIcon className="w-4 h-4" />,
  box: <ChartCandlestickIcon className="w-4 h-4" />,
  histogram: <ChartBarIcon className="w-4 h-4" />,
};

interface ChartConfigModalProps {
  chartSuggestions: Record<
    string,
    {
      supported: boolean;
      allowable_axes: {
        x: string[];
        y: Record<string, string[]>;
        z?: Record<string, string[]>;
      };
    }
  >;
  onChartSelect: (chartType: string, xAxis: string, yAxes: string[]) => void;
  loadingCharts: Set<string>;
  completedCharts: Set<string>;
}

const ChartConfigModal: React.FC<ChartConfigModalProps> = ({
  chartSuggestions,
  onChartSelect,
  loadingCharts,
  completedCharts,
}) => {
  const [selectedChartType, setSelectedChartType] = useState<string>("");
  const [selectedXAxis, setSelectedXAxis] = useState<string>("");
  const [selectedYAxes, setSelectedYAxes] = useState<string[]>([]);

  const handleChartTypeSelect = (chartType: string) => {
    setSelectedChartType(chartType);
    const suggestion = chartSuggestions[chartType];
    if (suggestion && suggestion.allowable_axes.x.length > 0) {
      const firstXAxis = suggestion.allowable_axes.x[0];
      setSelectedXAxis(firstXAxis);
      const yAxes = suggestion.allowable_axes.y[firstXAxis] || [];
      setSelectedYAxes(yAxes.length > 0 ? [yAxes[0]] : []);
    }
  };

  const handleXAxisChange = (xAxis: string) => {
    setSelectedXAxis(xAxis);
    const suggestion = chartSuggestions[selectedChartType];
    if (suggestion && suggestion.allowable_axes.y[xAxis]) {
      const yAxes = suggestion.allowable_axes.y[xAxis];
      setSelectedYAxes(yAxes.length > 0 ? [yAxes[0]] : []);
    } else {
      setSelectedYAxes([]);
    }
  };

  const handleYAxisToggle = (yAxis: string) => {
    setSelectedYAxes((prev) => {
      if (prev.includes(yAxis)) {
        return prev.filter((y) => y !== yAxis);
      } else {
        return [...prev, yAxis];
      }
    });
  };

  const handleGenerateChart = () => {
    if (selectedChartType && selectedXAxis && selectedYAxes.length > 0) {
      onChartSelect(selectedChartType, selectedXAxis, selectedYAxes);
    }
  };
  const parseSnakeCaseToTitleCase = (str: string) => {
    return str
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-sm underline text-blue-600 cursor-pointer px-2 w-[40px]"
        >
          <ChartNoAxesCombinedIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Chart</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Chart Type</label>
            <Select
              value={selectedChartType}
              onValueChange={handleChartTypeSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(chartSuggestions).map(
                  ([chartType, details]) => (
                    <SelectItem
                      key={chartType}
                      value={chartType}
                      disabled={!details.supported}
                      className="capitalize"
                      hideCheck
                    >
                      <div className="flex items-center gap-2">
                        {IconMap[chartType]} {chartType}
                        {loadingCharts.has(chartType) && (
                          <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                        )}
                        {completedCharts.has(chartType) &&
                          !loadingCharts.has(chartType) && (
                            <Check className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedChartType && (
            <div>
              <label className="text-sm font-medium mb-2 block">X-Axis</label>
              <Select value={selectedXAxis} onValueChange={handleXAxisChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-axis" />
                </SelectTrigger>
                <SelectContent>
                  {selectedChartType &&
                    chartSuggestions[selectedChartType]?.allowable_axes.x.map(
                      (xAxis: string) => (
                        <SelectItem key={xAxis} value={xAxis}>
                          {parseSnakeCaseToTitleCase(xAxis)}
                        </SelectItem>
                      )
                    )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Y-Axis Selection */}
          {selectedChartType && selectedXAxis && (
            <div>
              <label className="text-sm font-medium mb-2 block">Y-Axis</label>
              <div className="space-y-2">
                {chartSuggestions[selectedChartType]?.allowable_axes.y[
                  selectedXAxis
                ]?.map((yAxis: string) => (
                  <div key={yAxis} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={yAxis}
                      checked={selectedYAxes.includes(yAxis)}
                      onChange={() => handleYAxisToggle(yAxis)}
                      className="rounded"
                    />
                    <label htmlFor={yAxis} className="text-sm">
                      {parseSnakeCaseToTitleCase(yAxis)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          {selectedChartType && selectedXAxis && selectedYAxes.length > 0 && (
            <Button
              onClick={handleGenerateChart}
              disabled={loadingCharts.has(selectedChartType)}
              className="w-full"
            >
              {loadingCharts.has(selectedChartType) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Chart"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ChatMessage = React.memo(function ChatMessage({
  content,
  role,
  progressSteps,
  messageId,
  pending = false,
}: ChatMessageProps) {
  const {
    getThinkingTime,
    chartSuggestionsMap,
    chartDataMap,
    setChartData,
    rawResultMap,
    detailedFormattedResultMap,
    detailedRawResultMap,
    warehouseQueryMap,
  } = useStore();
  const [isOpen, setIsOpen] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState<Set<string>>(new Set());
  const [completedCharts, setCompletedCharts] = useState<Set<string>>(
    new Set()
  );
  const isWarehouseQuery = Object.keys(warehouseQueryMap ?? {}).includes(
    messageId
  );
  const chartSuggestions = chartSuggestionsMap[messageId];

  function isMarkdown(input: string) {
    const html = marked.parse(input);
    return /<\/?[a-z][\s\S]*>/i.test(html as string);
  }
  const parseContentToMarkdown = (content: unknown): string => {
    try {
      let parsedContent: unknown = content;
      
      if (typeof content === "string" && !isMarkdown(content)) {
        parsedContent = JSON.parse(
          content
            .replace(/'/g, '"')
            .replace(/\bNone\b/g, "null")
            .replace(/\bTrue\b/g, "true")
            .replace(/\bFalse\b/g, "false")
        );
      }

      // Type guard to check if content has columns and rows
      if (
        parsedContent && 
        typeof parsedContent === "object" && 
        parsedContent !== null &&
        "columns" in parsedContent && 
        "rows" in parsedContent
      ) {
        const { columns, rows } = parsedContent as { columns: string[]; rows: string[][] };
        const tableData = [columns, ...rows];
        return markdownTable(tableData);
      }

      // If content is a string, return it as is
      if (typeof content === "string") {
        return content;
      }

      // For other cases, stringify the content
      return JSON.stringify(parsedContent);
    } catch (error) {
      console.warn("Failed to parse content as JSON:", error);
      // If parsing fails, return the original content as string
      return typeof content === "string" ? content : JSON.stringify(content);
    }
  };
  const parsedContent = parseContentToMarkdown(content);

  const handleChartSelect = useCallback(
    async (chartType: string, xAxis: string, yAxes: string[]) => {
      if (!chartSuggestions) return;
      const suggestion = chartSuggestions[chartType];
      if (!suggestion || !suggestion.supported) return;

      setLoadingCharts((prev) => new Set(prev).add(chartType));

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://172.173.148.66:8000";

      try {
        const rawResult =
          detailedRawResultMap[messageId] || rawResultMap[messageId];
        const resp = await fetch(`${baseUrl}/charts/transform`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chart_type: chartType,
            x_axis: xAxis,
            y_axes: yAxes,
            raw_result: rawResult,
          }),
        });

        if (resp.ok) {
          const { chart_payload } = await resp.json();

          setChartData(messageId, chartType, JSON.parse(chart_payload));

          setCompletedCharts((prev) => new Set(prev).add(chartType));
        } else {
          console.error("Chart transform failed", await resp.text());
        }
      } catch (err) {
        console.error("Failed to transform chart", err);
      } finally {
        setLoadingCharts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chartType);
          return newSet;
        });
      }
    },
    [
      chartSuggestions,
      detailedRawResultMap,
      messageId,
      rawResultMap,
      setChartData,
    ]
  );

  useEffect(() => {
    if (!pending) {
      setIsOpen(false);
    }
  }, [pending]);

  const chartDataForMessage = chartDataMap[messageId];
  const chartTypes = chartDataForMessage
    ? Object.keys(chartDataForMessage)
    : [];
  const [selectedChartType, setSelectedChartType] = useState<
    string | undefined
  >(chartTypes[0]);

  useEffect(() => {
    if (chartTypes.length > 0 && !selectedChartType) {
      setSelectedChartType(chartTypes[0]);
    }
  }, [chartTypes, selectedChartType]);

  return (
    <div
      className={cn(
        "flex flex-col w-full mb-6",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "py-3 px-5 rounded-2xl max-w-[80%] transition-all",
          role === "user"
            ? "bg-primary text-primary-foreground rounded-tr-md rounded-br-2xl rounded-tl-2xl ml-auto"
            : "bg-none text-foreground rounded-tl-md rounded-bl-2xl rounded-tr-2xl mr-auto max-w-none w-full"
        )}
      >
        {(chartDataForMessage || detailedFormattedResultMap[messageId]) &&
        role === "tool" ? (
          <Tabs defaultValue="raw" className="w-full">
            <TabsList>
              <TabsTrigger value="raw">Raw</TabsTrigger>
              {detailedFormattedResultMap[messageId] && (
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
              )}
              {chartDataForMessage && (
                <TabsTrigger value="chart">Chart</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="raw" className="pt-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  a: (props) => (
                    <a
                      {...props}
                      className="text-primary underline hover:opacity-80"
                    />
                  ),
                  img: (props) => (
                    <img
                      {...props}
                      className="rounded-lg max-h-64 object-contain mx-auto"
                    />
                  ),
                  table: (props) => (
                    <div className="overflow-x-auto my-6 max-h-[400px]">
                      <table
                        {...props}
                        className="min-w-full border-collapse bg-background border border-border rounded-lg shadow-sm"
                      />
                    </div>
                  ),
                  thead: (props) => (
                    <thead
                      {...props}
                      className="bg-muted/80 dark:bg-muted/60"
                    />
                  ),
                  tbody: (props) => (
                    <tbody
                      {...props}
                      className="bg-background divide-y divide-border/50"
                    />
                  ),
                  tr: (props) => (
                    <tr
                      {...props}
                      className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/20"
                    />
                  ),
                  th: (props) => (
                    <th
                      {...props}
                      className="px-6 py-3 text-left text-sm font-semibold text-foreground/90 bg-gradient-to-b from-muted/60 to-muted/80 border-r border-border/50 last:border-r-0 first:rounded-tl-lg last:rounded-tr-lg"
                    />
                  ),
                  td: (props) => (
                    <td
                      {...props}
                      className="px-6 py-3 text-sm text-foreground/80 border-r border-border/30 last:border-r-0 whitespace-nowrap"
                    />
                  ),
                }}
              >
                {parsedContent}
              </ReactMarkdown>
            </TabsContent>
            {detailedFormattedResultMap[messageId] && (
              <TabsContent value="formatted" className="pt-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    a: (props) => (
                      <a
                        {...props}
                        className="text-primary underline hover:opacity-80"
                      />
                    ),
                    img: (props) => (
                      <img
                        {...props}
                        className="rounded-lg max-h-64 object-contain mx-auto"
                      />
                    ),
                    table: (props) => (
                      <div className="overflow-x-auto my-6 max-h-[400px]">
                        <table
                          {...props}
                          className="min-w-full border-collapse bg-background border border-border rounded-lg shadow-sm"
                        />
                      </div>
                    ),
                    thead: (props) => (
                      <thead
                        {...props}
                        className="bg-muted/80 dark:bg-muted/60"
                      />
                    ),
                    tbody: (props) => (
                      <tbody
                        {...props}
                        className="bg-background divide-y divide-border/50"
                      />
                    ),
                    tr: (props) => (
                      <tr
                        {...props}
                        className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/20"
                      />
                    ),
                    th: (props) => (
                      <th
                        {...props}
                        className="px-6 py-3 text-left text-sm font-semibold text-foreground/90 bg-gradient-to-b from-muted/60 to-muted/80 border-r border-border/50 last:border-r-0 first:rounded-tl-lg last:rounded-tr-lg"
                      />
                    ),
                    td: (props) => (
                      <td
                        {...props}
                        className="px-6 py-3 text-sm text-foreground/80 border-r border-border/30 last:border-r-0 whitespace-nowrap"
                      />
                    ),
                  }}
                >
                  {parseContentToMarkdown(
                    detailedFormattedResultMap[messageId]
                  )}
                </ReactMarkdown>
              </TabsContent>
            )}
            <TabsContent value="chart" className="pt-2">
              {chartTypes.length > 1 && role === "tool" && (
                <div className="mb-4 w-48">
                  <Select
                    value={selectedChartType}
                    onValueChange={(v) => setSelectedChartType(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select chart" />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map((ct) => (
                        <SelectItem key={ct} value={ct} className="capitalize">
                          {ct}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedChartType && (
                <div className="w-full">
                  <ChartRenderer
                    data={chartDataForMessage[selectedChartType] as unknown}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              a: (props) => (
                <a
                  {...props}
                  className="text-primary underline hover:opacity-80"
                />
              ),
              img: (props) => (
                <img
                  {...props}
                  className="rounded-lg max-h-64 object-contain mx-auto"
                />
              ),
              table: (props) => (
                <div className="overflow-x-auto my-6 max-h-[400px]">
                  <table
                    {...props}
                    className="min-w-full border-collapse bg-background border border-border rounded-lg shadow-sm"
                  />
                </div>
              ),
              thead: (props) => (
                <thead {...props} className="bg-muted/80 dark:bg-muted/60" />
              ),
              tbody: (props) => (
                <tbody
                  {...props}
                  className="bg-background divide-y divide-border/50"
                />
              ),
              tr: (props) => (
                <tr
                  {...props}
                  className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/20"
                />
              ),
              th: (props) => (
                <th
                  {...props}
                  className="px-6 py-3 text-left text-sm font-semibold text-foreground/90 bg-gradient-to-b from-muted/60 to-muted/80 border-r border-border/50 last:border-r-0 first:rounded-tl-lg last:rounded-tr-lg"
                />
              ),
              td: (props) => (
                <td
                  {...props}
                  className="px-6 py-3 text-sm text-foreground/80 border-r border-border/30 last:border-r-0 whitespace-nowrap"
                />
              ),
            }}
          >
            {parsedContent}
          </ReactMarkdown>
        )}
      </div>
      {!chartSuggestions && role === "tool" && isWarehouseQuery && (
        <div className="flex items-center gap-2">
          <span className="text-sm animate-text-wave-dark">
            Generating formatted data
          </span>
          <WandSparkles className="w-4 h-4" />
        </div>
      )}
      {chartSuggestions && role === "tool" && (
        <ChartConfigModal
          chartSuggestions={chartSuggestions}
          onChartSelect={handleChartSelect}
          loadingCharts={loadingCharts}
          completedCharts={completedCharts}
        />
      )}

      {role === "user" && progressSteps?.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={isOpen ? "item-1" : ""}
          onValueChange={(value) => setIsOpen(value === "item-1")}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <span>
                  {pending
                    ? "Thinking"
                    : `Thought for ${getThinkingTime(messageId)} seconds`}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col mb-2">
                <div className="w-full max-w-md">
                  {progressSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-[50%] w-0.5",
                            idx !== 0 && "bg-blue-300"
                          )}
                        />
                        <div
                          className={`w-2 h-2 rounded-full bg-blue-500 justify-center ${
                            idx === 0 ? "animate-pulse" : ""
                          }`}
                          style={{ zIndex: 1 }}
                        />
                        <div
                          className={cn(
                            "h-[50%] w-0.5",
                            idx !== progressSteps.length - 1 && "bg-blue-300"
                          )}
                        />
                      </div>
                      <div className="py-1">
                        <div className="ml-2 text-sm text-blue-900 dark:text-blue-100 bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded shadow animate-fade-in">
                          {step}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
});
