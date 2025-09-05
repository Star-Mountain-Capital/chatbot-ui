import { zodResolver } from '@hookform/resolvers/zod';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { format } from 'date-fns';
import {
  BookOpenTextIcon,
  CalendarIcon,
  CheckIcon,
  CircleCheckBigIcon,
  CopyIcon,
  CornerDownRightIcon,
  DotIcon,
  ExternalLinkIcon,
  FileDownIcon,
  FilterIcon,
  PaperclipIcon,
  PlayIcon,
  RotateCwIcon,
  SearchIcon,
  Share2Icon,
  SquarePenIcon,
  TrendingDownIcon,
  TrendingUp,
  TriangleAlert,
  WaypointsIcon,
  WorkflowIcon
} from 'lucide-react';
import type { MotionNodeAnimationOptions } from 'motion';
import * as motion from 'motion/react-client';
import {
  type DOMAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useForm } from 'react-hook-form';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { codeToHtml } from 'shiki';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import PromptField from '@/components/PromptField';
import {
  Alert,
  AlertButton,
  AlertDescription,
  AlertContainer,
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import NotionIcon from '@/icons/Notion';
import { cn } from '@/lib';
import { useStore } from '@/store';

type Data = (
  | {
      data: {
        heading: string;
      };
      id: string;
      type: 'heading';
    }
  | {
      data: {
        paragraph: string;
      };
      id: string;
      type: 'paragraph';
    }
  | {
      data: {
        list: string[];
      };
      id: string;
      type: 'list';
    }
  | {
      data: {
        rows: {
          cells: {
            cell: string;
            id: string;
          }[];
          id: string;
        }[];
        columns: {
          column: string;
          id: string;
        }[];
      };
      id: string;
      type: 'table';
    }
  | {
      data: {
        links: {
          description: string;
          id: string;
          link: string;
          name: string;
        }[];
      };
      id: string;
      type: 'link-group';
    }
  | {
      data: {
        amount: string;
        company: string;
        currency: string;
        date: string;
        powerBiLink: string;
        title: string;
      };
      id: string;
      type: 'metric';
    }
  | {
      data: {
        chartData: {
          month: string;
          [key: string]: number | string;
        }[];
        chartDate: string;
        chartDescription: string;
        chartLineDataKey: string;
        chartLineLabel: string;
        chartTrend: string;
        chartTrendDirection: 'DOWN' | 'UP';
        chartTitle: string;
        chartXAxisDataKey: string;
        powerBiLink: string;
        title: string;
      };
      id: string;
      type: 'chart';
    }
  | {
      id: string;
      type: 'space-divider';
    }
)[];

const FormSchema = z.object({
  ['investment']: z.string(),
  ['period-end']: z.date().optional()
});

interface Props {
  handleSendMessage: (message: string) => void;
  messages: ChatMessageProps[];
  showHardCodedData: boolean;
}

const ChatPanel = ({
  handleSendMessage,
  messages,
  showHardCodedData
}: Props) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema)
  });

  const { getThinkingTime, pending, progressMap } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const code = `SELECT customer_name, total_spent, last_purchase_date;\nFROM customers;\nWHERE total_spent > 500;\nORDER BY last_purchase_date DESC;`;

  const htmlRef = useRef<string>(undefined);

  const [error, setError] = useState();
  const [isEditing, setIsEditing] = useState(false);

  const animate = useMemo<MotionNodeAnimationOptions['animate']>(
    () => ({ rotate: 90 }),
    []
  );

  const transition = useMemo<MotionNodeAnimationOptions['transition']>(
    () => ({
      damping: 15,
      delay: 0.2,
      duration: 1,
      mass: 1,
      repeat: Infinity,
      stiffness: 100,
      type: 'spring'
    }),
    []
  );

  const handleConfirmButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {}, []);

  const handleCopyButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {}, []);

  const handleCopyQueryButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {
      void navigator.clipboard.writeText(messages[0].content);
    }, [messages]);

  const handleEditQueryButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {
      setIsEditing(true);
    }, []);

  const handleExportButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {}, []);

  const handleFollowUpPromptButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {}, []);

  const handleRunQueryButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {}, []);

  const handleShareButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {}, []);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data);
  };

  useEffect(() => {
    void (async () => {
      htmlRef.current = await codeToHtml(code, {
        lang: 'sql',
        themes: {
          light: 'min-light',
          dark: 'min-dark'
        }
      });
    })();
  }, [code]);

  const data: Data = [
    {
      data: {
        heading: 'Lorem ipsum dolor sit amet consectetur.'
      },
      id: uuidv4(),
      type: 'heading'
    },
    {
      data: {
        paragraph:
          'Lacus mauris auctor nulla in congue non dolor a aliquam. Congue risus arcu in netus convallis sapien blandit. Ac sodales quisque vel fringilla ut neque praesent. Ac velit tortor ac diam. Duis porta facilisis aliquam lorem lacus morbi laoreet adipiscing.'
      },
      id: uuidv4(),
      type: 'paragraph'
    },
    {
      data: {
        list: [
          'Lorem ipsum dolor sit amet consectetur',
          'Lorem ipsum dolor sit amet consectetur',
          'Lorem ipsum dolor sit amet consectetur'
        ]
      },
      id: uuidv4(),
      type: 'list'
    },
    {
      data: {
        columns: [
          { column: 'Head Text', id: uuidv4() },
          { column: 'Head Text', id: uuidv4() },
          { column: 'Head Text', id: uuidv4() },
          { column: 'Head Text', id: uuidv4() }
        ],
        rows: [
          {
            cells: [
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() }
            ],
            id: uuidv4()
          },
          {
            cells: [
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() }
            ],
            id: uuidv4()
          },
          {
            cells: [
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() },
              { cell: 'Table Cell Text', id: uuidv4() }
            ],
            id: uuidv4()
          }
        ]
      },
      id: uuidv4(),
      type: 'table'
    },
    {
      data: {
        links: [
          {
            description: 'Lorem ipsum dolor sit amet consectetur.',
            id: uuidv4(),
            link: 'https://google.com',
            name: 'Name of the link'
          },
          {
            description: 'Lorem ipsum dolor sit amet consectetur.',
            id: uuidv4(),
            link: 'https://google.com',
            name: 'Name of the link'
          },
          {
            description: 'Lorem ipsum dolor sit amet consectetur. ',
            id: uuidv4(),
            link: 'https://google.com',
            name: 'Name of the link'
          }
        ]
      },
      id: uuidv4(),
      type: 'link-group'
    },
    {
      data: {
        amount: '$7,051.40',
        company: 'AlphaSix Holding Company, LLC',
        currency: 'USD',
        date: 'January 10, 2025',
        powerBiLink: 'https://google.com',
        title: 'Budget Adjusted EBITDA'
      },
      id: uuidv4(),
      type: 'metric'
    },
    {
      data: {
        chartData: [
          { month: 'Jan', desktop: 186 },
          { month: 'Feb', desktop: 305 },
          { month: 'Mar', desktop: 237 },
          { month: 'Apr', desktop: 73 },
          { month: 'May', desktop: 209 },
          { month: 'Jun', desktop: 214 }
        ],
        chartDate: 'January - June 2024',
        chartDescription: 'Showing total visitors for the last 6 months',
        chartLineDataKey: 'desktop',
        chartLineLabel: 'Desktop',
        chartTrend: 'Trending up by 5.2% this month',
        chartTrendDirection: 'UP',
        chartTitle: 'Line Chart',
        chartXAxisDataKey: 'month',
        powerBiLink: 'https://google.com',
        title: 'Heading'
      },
      id: uuidv4(),
      type: 'chart'
    },
    {
      id: uuidv4(),
      type: 'space-divider'
    }
  ];

  return messages.length === 0 ? (
    <div className="flex grow items-center justify-center px-3">
      <div className="-mt-12 w-[640px] max-w-full lg:w-[720px]">
        <h1 className="mb-12 text-center text-3xl leading-none font-medium">
          What do you want to know today?
        </h1>
        <PromptField
          handleSendMessage={handleSendMessage}
          messages={messages}
        />
      </div>
    </div>
  ) : (
    <div className="flex h-full flex-col items-center justify-between gap-y-12 px-3 py-6">
      <div className="w-[640px] max-w-full lg:w-[720px]">
        {isEditing ? (
          <PromptField
            handleSendMessage={handleSendMessage}
            initialPrompt={messages[0].content}
            isEditing
            messages={messages}
            setIsEditing={setIsEditing}
          />
        ) : (
          <div className="border-input group hover:bg-alpha-90 relative mb-4 rounded-xl border p-4 transition-colors">
            {messages[0].content}
            <div
              ref={containerRef}
              className="absolute right-2 -bottom-5 flex gap-x-2 opacity-0 transition-opacity group-hover:opacity-100 has-[*:focus-visible]:opacity-100"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="backdrop-blur-xs"
                    onClick={handleEditQueryButtonClick}
                    size="icon"
                    variant="outline"
                  >
                    <SquarePenIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent container={containerRef.current}>
                  Edit Query
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="backdrop-blur-xs"
                    onClick={handleCopyQueryButtonClick}
                    size="icon"
                    variant="outline"
                  >
                    <CopyIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent container={containerRef.current}>
                  Copy Query
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
        {error && (
          <Alert>
            <AlertContainer>
              <TriangleAlert />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </AlertContainer>
            <AlertButton>
              <RotateCwIcon />
              Retry
            </AlertButton>
          </Alert>
        )}
        {pending ? (
          <Tabs
            key={1}
            defaultValue="tasks"
          >
            <TabsList>
              <TabsTrigger value="tasks">
                <WorkflowIcon />
                Tasks
              </TabsTrigger>
            </TabsList>
            <TabsContent
              className="space-y-2"
              value="tasks"
            >
              {false ? (
                <div className="flex items-center gap-x-2 pb-2 text-sm font-medium text-[#C97F03] dark:text-[#FFC564]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <rect
                      x="3"
                      y="2.5"
                      width="3"
                      height="11"
                      fill="currentColor"
                    />
                    <rect
                      x="10"
                      y="2.5"
                      width="3"
                      height="11"
                      fill="currentColor"
                    />
                  </svg>
                  Paused
                </div>
              ) : (
                <div className="text-brand flex items-center gap-x-2 pb-2 text-sm font-medium">
                  <motion.svg
                    animate={animate}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    transition={transition}
                  >
                    <rect
                      x="2.5"
                      y="2.5"
                      width="11"
                      height="11"
                      fill="currentColor"
                    />
                  </motion.svg>
                  Thinking...
                </div>
              )}
              {Object.hasOwn(progressMap, messages[0].messageId) && (
                <>
                  {progressMap[messages[0].messageId].map(task => (
                    <motion.div
                      key={task}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-x-2 text-sm"
                      initial={{ opacity: 0 }}
                    >
                      <div className="bg-outline mx-2 my-0.5 h-6 w-0.25" />
                      <div className="text-muted-foreground flex items-center gap-x-1">
                        {false ? (
                          <WaypointsIcon size={16} />
                        ) : (
                          <SearchIcon size={16} />
                        )}
                        {task}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs
            key={2}
            defaultValue="answer"
          >
            <TabsList>
              <TabsTrigger value="answer">
                <CircleCheckBigIcon />
                Answer
              </TabsTrigger>
              {showHardCodedData && (
                <TabsTrigger value="sources">
                  <PaperclipIcon />
                  Sources · 3
                </TabsTrigger>
              )}
              <TabsTrigger value="tasks">
                <WorkflowIcon />
                Tasks
              </TabsTrigger>
            </TabsList>
            <TabsContent
              className="space-y-4 overflow-y-auto"
              value="answer"
            >
              {showHardCodedData ? (
                <>
                  {data.map(item => {
                    if (item.type === 'heading') {
                      return (
                        <div
                          key={item.id}
                          className="text-lg font-medium"
                        >
                          {item.data.heading}
                        </div>
                      );
                    }

                    if (item.type === 'paragraph') {
                      return (
                        <div key={item.id}>
                          {item.data.paragraph}{' '}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="bg-secondary hover:bg-brand transition-color group ml-2 inline-flex gap-x-1 rounded-full px-2 py-0.5"
                                data-slot="button"
                                type="button"
                              >
                                <div className="group-hover:text-primary-foreground text-xs font-medium">
                                  Notion
                                </div>
                                <div className="text-muted-foreground group-hover:text-primary-foreground text-xs font-semibold">
                                  +1
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipPrimitive.Portal>
                              <TooltipPrimitive.Content
                                align="start"
                                className="bg-input dark:input/80 text-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md border p-2.5 text-balance backdrop-blur-3xl"
                                data-slot="tooltip-content"
                                side="bottom"
                                sideOffset={8}
                              >
                                <div className="text-muted-foreground mb-2 text-xs font-medium">
                                  2 Sources
                                </div>
                                <div className="bg-alpha-60 hover:bg-alpha-40 mb-2 rounded-sm p-3">
                                  <div className="mb-2 flex items-center gap-x-2 text-sm">
                                    <NotionIcon size={14} />
                                    Notion
                                  </div>
                                  <div className="mb-1 font-medium">
                                    Title of Document
                                  </div>
                                  <div className="text-muted-foreground line-clamp-2 w-[373px] text-sm font-light">
                                    Lorem ipsum dolor sit amet consectetur.
                                    Morbi sem egestas egestas molestie.
                                    Condimentum non pulvinar in nec tempus arcu
                                    sapien egestas ullamcorper. Vulputate sed
                                    vel ultrices vitae quis nisl. Magna habitant
                                    adipiscing mollis tristique proin nibh. A
                                    turpis ullamcorper adipiscing elementum
                                    ullamcorper. Penatibus bibendum diam eget
                                    tempor. Sed sit iaculis sagittis
                                    pellentesque in. Auctor etiam vivamus mattis
                                    vel. Turpis feugiat pellentesque risus
                                    fringilla volutpat sapien adipiscing
                                    pellentesque. In non sed consequat posuere
                                    neque lorem. Odio amet etiam posuere sed.
                                  </div>
                                </div>
                                <div className="bg-alpha-60 hover:bg-alpha-40 rounded-sm p-3">
                                  <div className="mb-2 flex items-center gap-x-2 text-sm">
                                    <NotionIcon size={14} />
                                    Notion
                                  </div>
                                  <div className="mb-1 font-medium">
                                    Title of Document
                                  </div>
                                  <div className="text-muted-foreground line-clamp-2 w-[373px] text-sm font-light">
                                    Lorem ipsum dolor sit amet consectetur.
                                    Morbi sem egestas egestas molestie.
                                    Condimentum non pulvinar in nec tempus arcu
                                    sapien egestas ullamcorper. Vulputate sed
                                    vel ultrices vitae quis nisl. Magna habitant
                                    adipiscing mollis tristique proin nibh. A
                                    turpis ullamcorper adipiscing elementum
                                    ullamcorper. Penatibus bibendum diam eget
                                    tempor. Sed sit iaculis sagittis
                                    pellentesque in. Auctor etiam vivamus mattis
                                    vel. Turpis feugiat pellentesque risus
                                    fringilla volutpat sapien adipiscing
                                    pellentesque. In non sed consequat posuere
                                    neque lorem. Odio amet etiam posuere sed.
                                  </div>
                                </div>
                              </TooltipPrimitive.Content>
                            </TooltipPrimitive.Portal>
                          </Tooltip>
                        </div>
                      );
                    }

                    if (item.type === 'list') {
                      return (
                        <ul key={item.id}>
                          {item.data.list.map(item => (
                            <li
                              key={item}
                              className="flex pb-1.5"
                            >
                              <DotIcon />
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (item.type === 'table') {
                      return (
                        <Table key={item.id}>
                          <TableHeader>
                            <TableRow>
                              {item.data.columns.map(column => (
                                <TableHead key={column.id}>
                                  {column.column}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.data.rows.map(row => (
                              <TableRow key={row.id}>
                                {row.cells.map(cell => (
                                  <TableCell key={cell.id}>
                                    {cell.cell}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      );
                    }

                    if (item.type === 'link-group') {
                      return (
                        <div
                          key={item.id}
                          className="space-y-2"
                        >
                          {item.data.links.map(
                            ({ description, id, link, name }) => (
                              <a
                                key={id}
                                className="border-border bg-custom-background dark:bg-input/30 hover:bg-accent dark:hover:bg-input/50 transition-color flex rounded-md border p-3"
                                href={link}
                                rel="noreferrer noopener"
                                target="_blank"
                              >
                                <div className="grow">
                                  <div className="mb-2 flex items-center gap-x-2">
                                    <NotionIcon size={14} />
                                    <div className="text-sm leading-none">
                                      {name}
                                    </div>
                                  </div>
                                  <div className="text-muted-foreground pl-5.5 text-sm leading-none font-light">
                                    {description}
                                  </div>
                                </div>
                                <ExternalLinkIcon
                                  className="text-muted-foreground self-center"
                                  size={16}
                                />
                              </a>
                            )
                          )}
                        </div>
                      );
                    }

                    if (item.type === 'metric') {
                      return (
                        <div
                          key={item.id}
                          className="bg-card border-border rounded-lg border"
                        >
                          <div className="text-muted-foreground border-b-border flex justify-between border-b px-6 py-3.5">
                            <div className="leading-none">
                              {item.data.title}
                            </div>
                            <a
                              className="flex items-center gap-x-2"
                              href={item.data.powerBiLink}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              <span className="text-sm leading-none underline">
                                View in PowerBI
                              </span>
                              <ExternalLinkIcon size={16} />
                            </a>
                          </div>
                          <div className="p-6">
                            <div className="mb-5 flex items-end gap-x-2">
                              <div className="text-4xl font-medium">
                                {item.data.amount}
                              </div>
                              <div className="text-muted-foreground text-lg">
                                {item.data.currency}
                              </div>
                            </div>
                            <div className="mb-1 text-lg font-medium">
                              {item.data.company}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-x-1.5">
                              <CalendarIcon size={16} />
                              <div className="leading-none">
                                {item.data.date}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (item.type === 'chart') {
                      return (
                        <div
                          key={item.id}
                          className="bg-card border-border rounded-lg border"
                        >
                          <div className="text-muted-foreground border-b-border flex justify-between border-b px-6 py-3.5">
                            <div className="leading-none">
                              {item.data.title}
                            </div>
                            <a
                              className="flex items-center gap-x-2"
                              href={item.data.powerBiLink}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              <span className="text-sm leading-none underline">
                                View in PowerBI
                              </span>
                              <ExternalLinkIcon size={16} />
                            </a>
                          </div>
                          <div className="p-6">
                            <div className="mb-1 text-lg font-medium">
                              {item.data.chartTitle}
                            </div>
                            <div className="text-muted-foreground mb-6 leading-none">
                              {item.data.chartDate}
                            </div>
                            <ChartContainer
                              className="mb-6"
                              config={{
                                [item.data.chartLineDataKey]: {
                                  label: item.data.chartLineLabel,
                                  color: 'var(--chart-1)'
                                }
                              }}
                            >
                              <LineChart
                                accessibilityLayer
                                data={item.data.chartData}
                                margin={{
                                  left: 12,
                                  right: 12
                                }}
                              >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                  axisLine={false}
                                  dataKey={item.data.chartXAxisDataKey}
                                  tickLine={false}
                                  tickMargin={8}
                                />
                                <ChartTooltip
                                  content={<ChartTooltipContent hideLabel />}
                                  cursor={false}
                                />
                                <Line
                                  dataKey={item.data.chartLineDataKey}
                                  dot={false}
                                  stroke="var(--color-desktop)"
                                  strokeWidth={2}
                                  type="natural"
                                />
                              </LineChart>
                            </ChartContainer>
                            <div className="mb-2 flex items-center gap-x-2">
                              <div className="text-sm leading-none font-medium">
                                {item.data.chartTrend}
                              </div>
                              {item.data.chartTrendDirection === 'DOWN' ? (
                                <TrendingDownIcon size={16} />
                              ) : (
                                <TrendingUp size={16} />
                              )}
                            </div>
                            <div className="text-muted-foreground text-sm leading-none">
                              {item.data.chartDescription}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <SeparatorPrimitive.Root
                        key={item.id}
                        data-slot="separator"
                        decorative
                        orientation="horizontal"
                        className="bg-border box-content h-px w-full shrink-0 bg-clip-content py-4"
                      />
                    );
                  })}
                  <div className="pt-2">
                    <div className="mb-2 flex gap-x-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="text-muted-foreground dark:hover:bg-accent hover:bg-accent rounded-sm backdrop-blur-xs"
                            onClick={handleCopyButtonClick}
                            size="icon"
                            variant="ghost"
                          >
                            <CopyIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="text-muted-foreground dark:hover:bg-accent hover:bg-accent rounded-sm backdrop-blur-xs"
                            onClick={handleExportButtonClick}
                            size="icon"
                            variant="ghost"
                          >
                            <FileDownIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="text-muted-foreground dark:hover:bg-accent hover:bg-accent rounded-sm backdrop-blur-xs"
                            onClick={handleShareButtonClick}
                            size="icon"
                            variant="ghost"
                          >
                            <Share2Icon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share</TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      {[
                        'Lorem ipsum dolor sit amet consectetur',
                        'At dapibus laoreet ipsum condimentum dictum tempor suspendisse',
                        'Nunc diam adipiscing dignissim in arcu venenatis amet vitae auctor nisl iaculis'
                      ].map(prompt => (
                        <button
                          key={prompt}
                          className="text-muted-foreground hover:text-foreground transition-color flex cursor-default items-center gap-x-2 py-1 hover:underline"
                          onClick={handleFollowUpPromptButtonClick}
                          type="button"
                        >
                          <CornerDownRightIcon size={16} />
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                messages
                  .filter((_, index) => index !== 0)
                  .map(message => (
                    <div key={message.content}>{message.content}</div>
                  ))
              )}
            </TabsContent>
            {showHardCodedData && (
              <TabsContent
                className="space-y-3"
                value="sources"
              >
                {[
                  {
                    description:
                      'Lorem ipsum dolor sit amet consectetur. Morbi sem egestas egestas molestie. Condimentum non pulvinar in nec tempus arcu sapien egestas ullamcorper. Vulputate sed vel ultrices vitae quis nisl. Magna habitant adipiscing mollis tristique proin nibh. A turpis ullamcorper adipiscing elementum ullamcorper. Penatibus bibendum diam eget tempor. Sed sit iaculis sagittis pellentesque in. Auctor etiam vivamus mattis vel. Turpis feugiat pellentesque risus fringilla volutpat sapien adipiscing pellentesque. In non sed consequat posuere neque lorem. Odio amet etiam posuere sed',
                    id: '1',
                    title: 'Title of Document'
                  },
                  {
                    description:
                      'Lorem ipsum dolor sit amet consectetur. Morbi sem egestas egestas molestie. Condimentum non pulvinar in nec tempus arcu sapien egestas ullamcorper. Vulputate sed vel ultrices vitae quis nisl. Magna habitant adipiscing mollis tristique proin nibh. A turpis ullamcorper adipiscing elementum ullamcorper. Penatibus bibendum diam eget tempor. Sed sit iaculis sagittis pellentesque in. Auctor etiam vivamus mattis vel. Turpis feugiat pellentesque risus fringilla volutpat sapien adipiscing pellentesque. In non sed consequat posuere neque lorem. Odio amet etiam posuere sed.',
                    id: '2',
                    title: 'Title of Document'
                  },
                  {
                    description:
                      'Lorem ipsum dolor sit amet consectetur. Morbi sem egestas egestas molestie. Condimentum non pulvinar in nec tempus arcu sapien egestas ullamcorper. Vulputate sed vel ultrices vitae quis nisl. Magna habitant adipiscing mollis tristique proin nibh. A turpis ullamcorper adipiscing elementum ullamcorper. Penatibus bibendum diam eget tempor. Sed sit iaculis sagittis pellentesque in. Auctor etiam vivamus mattis vel. Turpis feugiat pellentesque risus fringilla volutpat sapien adipiscing pellentesque. In non sed consequat posuere neque lorem. Odio amet etiam posuere sed.',
                    id: '3',
                    title: 'Title of Document'
                  }
                ].map(({ description, id, title }) => (
                  <div
                    key={id}
                    className="hover:bg-input/50 group bg-background dark:bg-input/30 rounded-md p-3 transition-colors"
                  >
                    <div className="mb-2 flex items-center gap-x-2 text-sm leading-3.5">
                      <NotionIcon size={14} />
                      Notion
                    </div>
                    <div className="mb-1 font-medium">{title}</div>
                    <div className="text-muted-foreground group-hover:text-foreground line-clamp-2 text-sm font-light">
                      {description}
                    </div>
                  </div>
                ))}
              </TabsContent>
            )}
            <TabsContent
              className="space-y-2"
              value="tasks"
            >
              {showHardCodedData ? (
                <>
                  <div className="pb-2 text-sm font-medium">
                    Thought for 12 seconds:
                  </div>
                  <div className="flex items-center gap-x-2 text-sm">
                    <div className="bg-outline mx-2 my-0.5 h-6 w-0.25" />
                    <div className="text-muted-foreground flex items-center gap-x-1">
                      <WaypointsIcon size={16} />
                      Analyzing Query to determine best approach
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2 text-sm">
                    <div className="bg-outline mx-2 my-0.5 h-6 w-0.25" />
                    <div className="text-muted-foreground flex items-center gap-x-1">
                      <SearchIcon size={16} />
                      Searching for relevant DAX measures
                    </div>
                  </div>
                  <div className="flex gap-x-2 pb-4">
                    <div className="bg-outline mx-2 my-0.5 w-0.25" />
                    <div className="grow">
                      <div className="text-muted-foreground mb-2 flex items-center gap-x-2">
                        <BookOpenTextIcon size={16} />
                        <div className="text-sm">Reading Sources · 16</div>
                      </div>
                      <div className="bg-card border-border rounded-lg border p-2">
                        <div className="flex gap-x-2 p-2">
                          <NotionIcon size={14} />
                          <div className="text-sm leading-none">
                            Title of Document
                          </div>
                        </div>
                        <div className="flex gap-x-2 p-2">
                          <NotionIcon size={14} />
                          <div className="text-sm leading-none">
                            Title of Document
                          </div>
                        </div>
                        <div className="flex gap-x-2 p-2">
                          <NotionIcon size={14} />
                          <div className="text-sm leading-none">
                            Title of Document
                          </div>
                        </div>
                        <div className="flex gap-x-2 p-2">
                          <NotionIcon size={14} />
                          <div className="text-sm leading-none">
                            Title of Document
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-4">
                    <div className="mb-4">
                      Please select an investment and time period
                    </div>
                    <div className="flex items-center gap-x-2 text-sm">
                      <div className="bg-outline mx-2 my-0.5 h-40 w-0.25" />
                      <Form {...form}>
                        <form
                          className="bg-custom-background dark:bg-input/50 border-outline dark:border-input-dark w-full rounded-lg border px-4 pt-6 pb-4 shadow-xl"
                          onSubmit={event => {
                            void form.handleSubmit(onSubmit)(event);
                          }}
                        >
                          <div className="mb-6 flex gap-x-4">
                            <FormField
                              control={form.control}
                              name="investment"
                              render={({ field }) => (
                                <FormItem className="w-full">
                                  <FormLabel>Investment</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an investment" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectItem value="investment-1">
                                          Investment 1
                                        </SelectItem>
                                        <SelectItem value="investment-2">
                                          Investment 2
                                        </SelectItem>
                                        <SelectItem value="investment-3">
                                          Investment 3
                                        </SelectItem>
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="period-end"
                              render={({ field }) => (
                                <FormItem className="flex w-full flex-col">
                                  <FormLabel>Period End</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value &&
                                              'text-muted-foreground'
                                          )}
                                          variant={'outline'}
                                        >
                                          {field.value ? (
                                            format(field.value, 'PPP')
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      align="start"
                                      className="w-auto p-0"
                                    >
                                      <Calendar
                                        captionLayout="dropdown"
                                        mode="single"
                                        onSelect={field.onChange}
                                        selected={field.value}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            onClick={handleConfirmButtonClick}
                            variant="brand"
                          >
                            <CheckIcon />
                            Confirm
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2 text-sm">
                    <div className="bg-outline mx-2 my-0.5 h-6 w-0.25" />
                    <div className="text-muted-foreground flex items-center gap-x-1">
                      <FilterIcon size={16} />
                      Applied Filters:
                    </div>
                    <div className="border-outline rounded-xl border px-2 py-0.75 text-sm">
                      AlphaSix Holding Company, LLC
                    </div>
                    <div className="border-outline rounded-xl border px-2 py-0.75 text-sm">
                      12/31/2024
                    </div>
                  </div>
                  <div className="py-4">
                    <div className="mb-4">Please (do something)</div>
                    <div className="flex gap-x-2">
                      <div className="bg-outline mx-2 my-0.5 w-0.25" />
                      <div className="border-border dark:border-input-dark bg-accent dark:bg-input/50 grow overflow-hidden rounded-lg border shadow-xl">
                        <div className="border-b-border dark:border-b-input-dark bg-background dark:bg-input/30 flex items-center gap-x-2 border-b p-3">
                          <div className="grow text-sm leading-none">Sql</div>
                          <div
                            className="text-muted-foreground flex items-center gap-x-1.5"
                            onClick={() => {
                              void navigator.clipboard.writeText(code);
                            }}
                          >
                            <CopyIcon size={16} />
                            <div className="text-xs font-medium">Copy</div>
                          </div>
                        </div>
                        {htmlRef.current && (
                          <div
                            // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
                            dangerouslySetInnerHTML={{
                              __html: htmlRef.current
                            }}
                          />
                        )}
                        <div className="bg-background dark:bg-input/30 border-t-border dark:border-t-input-dark border-t p-3">
                          <Button
                            onClick={handleRunQueryButtonClick}
                            variant="brand"
                          >
                            <PlayIcon />
                            Run Query
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-x-2">
                    <div className="bg-outline mx-2 my-0.5 w-0.25" />
                    <div className="grow">
                      <div className="text-muted-foreground mb-2 flex items-center gap-x-1">
                        <PlayIcon size={16} />
                        <div className="text-sm">
                          Query executed in 0.4s · 3 rows returned
                        </div>
                      </div>
                      <div className="border-border bg-card rounded-lg border p-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>customer_name</TableHead>
                              <TableHead>total_spent</TableHead>
                              <TableHead>last_purchase_date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Alice Chen</TableCell>
                              <TableCell>$1,200.00</TableCell>
                              <TableCell>2025-07-20</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Javier Morales</TableCell>
                              <TableCell>$850.50</TableCell>
                              <TableCell>2025-07-18</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Rachel Singh</TableCell>
                              <TableCell>$530.25</TableCell>
                              <TableCell>2025-07-15</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                Object.hasOwn(progressMap, messages[0].messageId) && (
                  <>
                    <div className="pb-2 text-sm font-medium">
                      {`Thought for ${getThinkingTime(messages[0].messageId).toString()} seconds:`}
                    </div>
                    {progressMap[messages[0].messageId].map(task => (
                      <div
                        key={task}
                        className="flex items-center gap-x-2 text-sm"
                      >
                        <div className="bg-outline mx-2 my-0.5 h-6 w-0.25" />
                        <div className="text-muted-foreground flex items-center gap-x-1">
                          <SearchIcon size={16} />
                          {task}
                        </div>
                      </div>
                    ))}
                  </>
                )
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      <div className="w-[740px] max-w-full lg:w-[820px]">
        <PromptField
          handleSendMessage={handleSendMessage}
          messages={messages}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
