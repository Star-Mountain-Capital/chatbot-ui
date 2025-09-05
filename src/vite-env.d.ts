/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_ALLOWED_IFRAME_DOMAIN: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV: string;
  readonly VITE_WS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type MessageRole = 'user' | 'tool';

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
  loading?: boolean;
  progressSteps: string[];
  messageId: string;
  thinkingEndTime?: Date;
  thinkingStartTime?: Date;
  pending?: boolean;
  onSendConfirmationResponse?: (
    messageId: string,
    confirmationMessage: string
  ) => void;
}
