import { useState, useRef, useEffect } from 'react';

import { useStore } from '@/store';

interface UseChatInputProps {
  messages: ChatMessageProps[];
  onSendMessage: (message: string) => void;
  connectionStatus: string;
  hasActiveRequest: boolean;
}

export function useChatInput({
  messages,
  onSendMessage,
  connectionStatus,
  hasActiveRequest
}: UseChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get filters from store
  const { filtersMap } = useStore();

  // Find the most recent message that has filters and is still active
  const activeFilters = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (filtersMap[message.messageId]) {
        return {
          messageId: message.messageId,
          filters: filtersMap[message.messageId]
        };
      }
    }
    return null;
  })();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Tooltip auto-show/hide logic
  useEffect(() => {
    setShowTooltip(true);
    const timer = setTimeout(() => {
      if (!isHovering) {
        setShowTooltip(false);
      }
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [isHovering]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      inputValue.trim() &&
      connectionStatus === 'connected' &&
      !hasActiveRequest
    ) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return {
    inputValue,
    setInputValue,
    showTooltip,
    messagesEndRef,
    activeFilters,
    handleSubmit,
    setIsHovering
  };
}
