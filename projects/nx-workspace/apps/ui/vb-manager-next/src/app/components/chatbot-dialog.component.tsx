'use client';

import {
  Dialog,
  Flex,
  Text,
  Button,
  TextField,
  ScrollArea,
} from '@radix-ui/themes';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatSuggestion {
  title: string;
  prompt: string;
}

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  systemPrompt?: string;
  suggestions?: ChatSuggestion[];
}

const MAX_MESSAGES = 20;

const compactConversation = (messages: Message[]): Message[] => {
  if (messages.length <= MAX_MESSAGES) return messages;

  const summary: Message = {
    role: 'assistant',
    content: `[Previous conversation summarized: ${Math.floor(
      messages.length / 2,
    )} exchanges]`,
  };

  return [summary, ...messages.slice(-MAX_MESSAGES + 1)];
};

export const ChatbotDialog = ({
  open,
  onOpenChange,
  initialPrompt,
  systemPrompt,
  suggestions = [],
}: ChatbotDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (initialPrompt && open && messages.length === 0) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    const compactedMessages = compactConversation(updatedMessages);

    abortControllerRef.current = new AbortController();

    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages([...compactedMessages, assistantMessage]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: compactedMessages,
        systemPrompt,
      }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok || !response.body) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Error: Failed to get response';
        updated[updated.length - 1].isStreaming = false;
        return updated;
      });
      setIsStreaming(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let lastUpdate = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedContent += chunk;

      const now = Date.now();
      if (now - lastUpdate > 50 || done) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = accumulatedContent;
          return updated;
        });
        lastUpdate = now;
      }
    }

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1].content = accumulatedContent;
      return updated;
    });

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1].isStreaming = false;
      return updated;
    });

    setIsStreaming(false);
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 700, maxHeight: '80vh' }}>
        <Dialog.Title>Jarvis</Dialog.Title>

        <Flex direction="column" gap="3" style={{ height: '60vh' }}>
          <ScrollArea ref={scrollRef} style={{ flex: 1, padding: '1rem' }}>
            <Flex direction="column" gap="3">
              {messages.map((message, index) => (
                <Flex
                  key={index}
                  direction="column"
                  gap="1"
                  className={`p-3 rounded ${
                    message.role === 'user'
                      ? 'bg-blue-100 dark:bg-blue-900/20 ml-8'
                      : 'bg-gray-100 dark:bg-gray-800 mr-8'
                  }`}
                >
                  <Text size="1" weight="bold" color="gray">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </Text>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {message.role === 'user' ? (
                      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Text>
                    ) : message.isStreaming ? (
                      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Text>
                    ) : (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    )}
                  </div>
                </Flex>
              ))}
            </Flex>
          </ScrollArea>

          <Flex direction="column" gap="2">
            {messages.length === 0 && suggestions.length > 0 && (
              <Flex direction="row" gap="2" wrap="wrap" align="center">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSend(suggestion.prompt)}
                    variant="soft"
                    size="1"
                  >
                    {suggestion.title}
                  </Button>
                ))}
              </Flex>
            )}
            <TextField.Root
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isStreaming}
            />
            <Flex gap="2" justify="end">
              <Button
                onClick={handleClear}
                variant="soft"
                disabled={isStreaming}
              >
                Clear
              </Button>
              <Button
                onClick={() => handleSend()}
                disabled={isStreaming || !input.trim()}
              >
                {isStreaming ? 'Sending...' : 'Send'}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
