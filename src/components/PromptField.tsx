import {
  ArrowUpIcon,
  AtSignIcon,
  FilePlusIcon,
  RefreshCwIcon,
  XIcon
} from 'lucide-react';
import {
  type Dispatch,
  type DOMAttributes,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useChatInput } from '@/hooks/useChatInput';
import { cn } from '@/lib';
import { useStore } from '@/store';

interface Props {
  handleSendMessage: (message: string) => void;
  initialPrompt?: string;
  isEditing?: boolean;
  messages: ChatMessageProps[];
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
}

const PromptField = ({
  handleSendMessage,
  initialPrompt = '',
  isEditing = false,
  messages,
  setIsEditing
}: Props) => {
  const { businessEntities, pending, status } = useStore();

  const { handleSubmit, setInputValue } = useChatInput({
    connectionStatus: status,
    hasActiveRequest: pending,
    messages,
    onSendMessage: handleSendMessage
  });

  const dragDepthRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [files, setFiles] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [prompt, setPrompt] = useState<string>('');

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.focus();
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleChange: DOMAttributes<HTMLTextAreaElement>['onChange'] =
    event => {
      setPrompt(event.currentTarget.value);
      setInputValue(event.currentTarget.value);
    };

  const handleKeyDown: DOMAttributes<HTMLTextAreaElement>['onKeyDown'] =
    event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        setPrompt('');

        if (isEditing && setIsEditing) {
          setIsEditing(false);
        }
        handleSubmit(event);
      }
    };

  const handleDragEnter: DOMAttributes<HTMLDivElement>['onDragEnter'] =
    event => {
      event.preventDefault();

      dragDepthRef.current += 1;
      setIsDraggingOver(true);
    };

  const handleDragLeave: DOMAttributes<HTMLDivElement>['onDragLeave'] = () => {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDragOver: DOMAttributes<HTMLDivElement>['onDragOver'] = event => {
    event.preventDefault();
  };

  const handleDrop: DOMAttributes<HTMLDivElement>['onDrop'] = event => {
    event.preventDefault();

    dragDepthRef.current = 0;
    setIsDraggingOver(false);

    const { name, type } = event.dataTransfer.files[0];

    setFiles([
      {
        id: uuidv4(),
        name,
        type:
          type === 'image/jpeg'
            ? 'JPEG'
            : type === 'image/png'
              ? 'PNG'
              : type === 'image/webp'
                ? 'WebP'
                : ''
      },
      ...files
    ]);
  };

  const handleFormSubmit: DOMAttributes<HTMLFormElement>['onSubmit'] =
    event => {
      if (isEditing && setIsEditing) {
        setIsEditing(false);
      }
      handleSubmit(event);
    };

  const handleRemoveFileButtonClick = (id: string) => () => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleXButtonClick: DOMAttributes<HTMLButtonElement>['onClick'] =
    useCallback(() => {
      if (!setIsEditing) return;

      setIsEditing(false);
    }, [setIsEditing]);

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <form
        className={cn(
          'border-input dark:bg-input/30 hover:not-focus-within:bg-accent dark:hover:not-focus-within:bg-input/50 relative rounded-xl border bg-white/50 backdrop-blur-[50px] transition-colors',
          isDraggingOver && 'border-dashed opacity-30',
          isEditing && 'mb-4 shadow-2xl'
        )}
        onSubmit={handleFormSubmit}
      >
        {files.length !== 0 && (
          <div className="flex gap-x-2 overflow-x-hidden px-4 pt-4">
            {files.map(({ id, name, type }) => (
              <div
                key={id}
                className="bg-alpha-70 flex w-64 shrink-0 grow-0 gap-x-3 rounded-md p-2"
              >
                <div className="size-10 shrink-0 rounded-sm bg-[#AA5E5E]" />
                <div className="min-w-0 grow text-sm">
                  <div className="truncate font-medium">{name}</div>
                  <div className="text-muted-foreground">{type}</div>
                </div>
                <button
                  aria-label="Remove file"
                  className="focus:ring-ring ring-offset-background self-center rounded-xs opacity-70 transition-all hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                  onClick={handleRemoveFileButtonClick(id)}
                  type="button"
                >
                  <XIcon
                    className="block"
                    size={16}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <textarea
            ref={textareaRef}
            aria-label="Prompt field"
            className="placeholder:text-muted-foreground block field-sizing-content max-h-52 w-full resize-none p-4 outline-none"
            name="prompt-field"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            value={prompt}
          />
          {prompt === '' && (
            <div className="text-muted-foreground pointer-events-none absolute top-4 right-4 opacity-40 select-none">
              Type @ to mention or add items
            </div>
          )}
        </div>
        <div className="flex justify-between p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <AtSignIcon />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Entities</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Assets</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="h-96 overflow-y-auto">
                      {businessEntities.assets.map(asset => (
                        <DropdownMenuItem key={asset.id}>
                          {asset.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Funds</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {businessEntities.funds.map(fund => (
                        <DropdownMenuItem key={fund.id}>
                          {fund.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Metrics</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Metric 1</DropdownMenuItem>
                  <DropdownMenuItem>Metric 2</DropdownMenuItem>
                  <DropdownMenuItem>Metric 3</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Time Filters</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Date</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Period</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Last Month</DropdownMenuItem>
                      <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
                      <DropdownMenuItem>Last 6 Months</DropdownMenuItem>
                      <DropdownMenuItem>Last 12 Months</DropdownMenuItem>
                      <DropdownMenuItem>YTD</DropdownMenuItem>
                      <DropdownMenuItem>MTD</DropdownMenuItem>
                      <DropdownMenuItem>QTD</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Frequency</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Frequency 1</DropdownMenuItem>
                      <DropdownMenuItem>Frequency 2</DropdownMenuItem>
                      <DropdownMenuItem>Frequency 3</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Documents</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Document 1</DropdownMenuItem>
                  <DropdownMenuItem>Document 2</DropdownMenuItem>
                  <DropdownMenuItem>Document 3</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Operational Data
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Data 1</DropdownMenuItem>
                  <DropdownMenuItem>Data 2</DropdownMenuItem>
                  <DropdownMenuItem>Data 3</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>People & Roles</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Person 1</DropdownMenuItem>
                  <DropdownMenuItem>Role 1</DropdownMenuItem>
                  <DropdownMenuItem>Role 2</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          {isEditing ? (
            <div className="flex gap-x-2">
              <Button
                onClick={handleXButtonClick}
                type="button"
                size="icon"
                variant="outline"
              >
                <XIcon />
              </Button>
              <Button
                disabled={prompt.trim() === ''}
                type="submit"
                variant="brand"
              >
                <RefreshCwIcon />
                Update Query
              </Button>
            </div>
          ) : (
            <Button
              disabled={prompt.trim() === ''}
              size="icon"
              type="submit"
              variant="brand"
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </form>
      {isDraggingOver && (
        <div className="bg-accent dark:bg-input/50 absolute inset-0 flex items-center justify-center rounded-xl">
          <div className="text-brand flex items-center gap-x-2">
            <FilePlusIcon size={20} />
            <p>Drop to upload file here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptField;
