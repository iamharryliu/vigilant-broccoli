'use client';

import {
  Dialog,
  Flex,
  Text,
  Button,
  TextField,
  ScrollArea,
  Card,
} from '@radix-ui/themes';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Maximize2, Minimize2, X, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  displayContent?: string;
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (initialPrompt && open && messages.length === 0) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const hasModifier = e.ctrlKey || e.metaKey;

      if (e.key.toLowerCase() === 'f' && !hasModifier) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isFullscreen]);

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
      <Dialog.Content
        style={{
          maxWidth: isFullscreen ? '95vw' : 700,
          maxHeight: isFullscreen ? '95vh' : '80vh',
        }}
      >
        <Flex justify="between" align="center" style={{ minHeight: '2.5rem' }}>
          <Dialog.Title style={{ margin: 0 }}>Jarvis</Dialog.Title>
          <Flex gap="6" align="center">
            <Button onClick={handleClear} variant="ghost" size="3">
              <RotateCcw size={16} />
            </Button>
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="ghost"
              size="3"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
            <Dialog.Close>
              <Button variant="ghost" size="3">
                <X size={16} />
              </Button>
            </Dialog.Close>
          </Flex>
        </Flex>

        <Flex
          direction="column"
          gap="3"
          style={{
            height: isFullscreen ? '85vh' : '60vh',
            transition: 'height 0.3s ease',
          }}
        >
          <ScrollArea
            ref={scrollRef}
            style={{ flex: 1, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
          >
            <Flex direction="column" gap="2" style={{ padding: '0 1rem' }}>
              {messages.map((message, index) => (
                <Card
                  key={index}
                  style={{
                    maxWidth: '85%',
                    alignSelf:
                      message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Text
                    size="1"
                    weight="medium"
                    color={message.role === 'user' ? 'blue' : 'gray'}
                  >
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </Text>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {message.role === 'user' ? (
                      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.displayContent || message.content}
                      </Text>
                    ) : message.isStreaming ? (
                      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Text>
                    ) : (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    )}
                  </div>
                </Card>
              ))}
            </Flex>
          </ScrollArea>

          <Flex direction="column" gap="2">
            {messages.length === 0 && suggestions.length > 0 && (
              <Flex direction="row" gap="2" wrap="wrap" align="center">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      const userMessage: Message = {
                        role: 'user',
                        content: suggestion.prompt,
                        displayContent: suggestion.title,
                      };
                      const updatedMessages = [...messages, userMessage];
                      setMessages(updatedMessages);
                      setInput('');
                      setIsStreaming(true);

                      const compactedMessages =
                        compactConversation(updatedMessages);
                      abortControllerRef.current = new AbortController();

                      const assistantMessage: Message = {
                        role: 'assistant',
                        content: '',
                        isStreaming: true,
                      };
                      setMessages([...compactedMessages, assistantMessage]);

                      fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          messages: compactedMessages,
                          systemPrompt,
                        }),
                        signal: abortControllerRef.current.signal,
                      }).then(async response => {
                        if (!response.ok || !response.body) {
                          setMessages(prev => {
                            const updated = [...prev];
                            updated[updated.length - 1].content =
                              'Error: Failed to get response';
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
                              updated[updated.length - 1].content =
                                accumulatedContent;
                              return updated;
                            });
                            lastUpdate = now;
                          }
                        }

                        setMessages(prev => {
                          const updated = [...prev];
                          updated[updated.length - 1].content =
                            accumulatedContent;
                          updated[updated.length - 1].isStreaming = false;
                          return updated;
                        });

                        setIsStreaming(false);
                      });
                    }}
                    variant="soft"
                    size="2"
                  >
                    {suggestion.title}
                  </Button>
                ))}
              </Flex>
            )}
            <Flex gap="2" align="center">
              <TextField.Root
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isStreaming}
                style={{ flex: 1 }}
              />
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
