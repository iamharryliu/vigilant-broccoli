'use client';

import {
  Dialog,
  Flex,
  Text,
  Button,
  TextField,
  ScrollArea,
  Card,
  Select,
} from '@radix-ui/themes';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Maximize2,
  Minimize2,
  X,
  RotateCcw,
  Image,
  Trash2,
  Mic,
  Square,
} from 'lucide-react';
import {
  LLM_MODEL,
  LLM_MODELS,
  LLMModel,
  modelSupportsImageInput,
  modelSupportsImageOutput,
} from '@vigilant-broccoli/common-js';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface MessageImage {
  data: string;
  mimeType: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  displayContent?: string;
  images?: MessageImage[];
}

interface ChatSuggestion {
  title: string;
  prompt?: string;
  onClick?: () => Promise<{ prompt: string } | void>;
}

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  systemPrompt?: string;
  suggestions?: ChatSuggestion[];
}

const MAX_MESSAGES = 20;

const CONST_ERROR_MESSAGE = 'Error: Failed to get response';
const CONST_STREAM_UPDATE_INTERVAL = 50;
const DEFAULT_CHAT_MODEL = LLM_MODEL.GPT_4O;
const CHAT_MODELS = LLM_MODELS.filter(
  model => !modelSupportsImageOutput(model),
);

const formatModelLabel = (model: string) =>
  model
    .split('-')
    .map(part => part.toUpperCase())
    .join(' ');

const MessageContent = ({ message }: { message: Message }) => {
  if (message.role === 'user') {
    return (
      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
        {message.displayContent || message.content}
      </Text>
    );
  }

  if (message.isStreaming) {
    return (
      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
        {message.content}
      </Text>
    );
  }

  return <ReactMarkdown>{message.content}</ReactMarkdown>;
};

const ImagePreview = ({
  img,
  index,
  onRemove,
}: {
  img: MessageImage;
  index: number;
  onRemove: () => void;
}) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-block',
    }}
  >
    <img
      src={`data:${img.mimeType};base64,${img.data}`}
      alt={`Preview ${index + 1}`}
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '0.5rem',
        objectFit: 'cover',
      }}
    />
    <Button
      size="1"
      variant="solid"
      color="red"
      onClick={onRemove}
      style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        minWidth: '24px',
        minHeight: '24px',
        padding: '4px',
        borderRadius: '50%',
      }}
    >
      <Trash2 size={12} />
    </Button>
  </div>
);

const DialogHeader = ({
  isFullscreen,
  onClear,
  onToggleFullscreen,
}: {
  isFullscreen: boolean;
  onClear: () => void;
  onToggleFullscreen: () => void;
}) => (
  <Flex justify="between" align="center" style={{ minHeight: '2.5rem' }}>
    <Dialog.Title style={{ margin: 0 }}>Jarvis</Dialog.Title>
    <Flex gap="6" align="center">
      <Button onClick={onClear} variant="ghost" size="3">
        <RotateCcw size={16} />
      </Button>
      <Button onClick={onToggleFullscreen} variant="ghost" size="3">
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </Button>
      <Dialog.Close>
        <Button variant="ghost" size="3">
          <X size={16} />
        </Button>
      </Dialog.Close>
    </Flex>
  </Flex>
);

const MessagesArea = ({
  messages,
  isDragging,
  scrollRef,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  messages: Message[];
  isDragging: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) => (
  <div
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    style={{
      flex: 1,
      position: 'relative',
      border: isDragging ? '2px dashed var(--accent-9)' : 'none',
      borderRadius: '0.5rem',
      transition: 'border 0.2s ease',
      overflow: 'hidden',
      minHeight: 0,
    }}
  >
    {isDragging && (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--accent-2)',
          borderRadius: '0.5rem',
          zIndex: 10,
        }}
      >
        <Text size="4" weight="medium" color="blue">
          Drop images here
        </Text>
      </div>
    )}
    <ScrollArea
      ref={scrollRef}
      style={{
        height: '100%',
      }}
    >
      <Flex direction="column" gap="2" style={{ padding: '0.5rem 1rem' }}>
        {messages.map((message, index) => (
          <Card
            key={index}
            style={{
              maxWidth: '85%',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Text
              size="1"
              weight="medium"
              color={message.role === 'user' ? 'blue' : 'gray'}
            >
              {message.role === 'user' ? 'You' : 'Assistant'}
            </Text>
            {message.images && message.images.length > 0 && (
              <Flex gap="2" wrap="wrap" style={{ marginTop: '0.5rem' }}>
                {message.images.map((img, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={`data:${img.mimeType};base64,${img.data}`}
                    alt={`Uploaded ${imgIndex + 1}`}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '0.5rem',
                      objectFit: 'cover',
                    }}
                  />
                ))}
              </Flex>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MessageContent message={message} />
            </div>
          </Card>
        ))}
      </Flex>
    </ScrollArea>
  </div>
);

const SuggestionsBar = ({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: ChatSuggestion[];
  onSuggestionClick: (suggestion: ChatSuggestion) => void;
}) => (
  <Flex direction="row" gap="2" wrap="wrap" align="center">
    {suggestions.map((suggestion, index) => (
      <Button
        key={index}
        onClick={() => onSuggestionClick(suggestion)}
        variant="soft"
        size="2"
      >
        {suggestion.title}
      </Button>
    ))}
  </Flex>
);

const ImagePreviewList = ({
  images,
  onImageRemove,
}: {
  images: MessageImage[];
  onImageRemove: (index: number) => void;
}) => (
  <Flex gap="2" wrap="wrap" align="center">
    {images.map((img, index) => (
      <ImagePreview
        key={index}
        img={img}
        index={index}
        onRemove={() => onImageRemove(index)}
      />
    ))}
  </Flex>
);

const getInputPlaceholder = (
  isRecording: boolean,
  isProcessing: boolean,
): string => {
  if (isRecording) return 'Recording...';
  if (isProcessing) return 'Processing...';
  return 'Type your message...';
};

const isInputDisabled = (
  isStreaming: boolean,
  isRecording: boolean,
  isProcessing: boolean,
): boolean => isStreaming || isRecording || isProcessing;

const isSendDisabled = (
  isStreaming: boolean,
  input: string,
  uploadedImagesCount: number,
): boolean => isStreaming || (!input.trim() && uploadedImagesCount === 0);

const InputControls = ({
  fileInputRef,
  textInputRef,
  input,
  isStreaming,
  isRecording,
  isProcessing,
  uploadedImages,
  selectedModel,
  modelOptions,
  onImageUpload,
  onModelChange,
  onToggleRecording,
  onInputChange,
  onKeyDown,
  onSend,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  textInputRef: React.RefObject<HTMLInputElement>;
  input: string;
  isStreaming: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  uploadedImages: MessageImage[];
  selectedModel: LLMModel;
  modelOptions: LLMModel[];
  onImageUpload: (files: FileList | null) => void;
  onModelChange: (model: LLMModel) => void;
  onToggleRecording: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
}) => (
  <Flex gap="2" align="center">
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={e => onImageUpload(e.target.files)}
      style={{ display: 'none' }}
    />
    <Button
      onClick={() => fileInputRef.current?.click()}
      variant="soft"
      disabled={isStreaming || isRecording}
      aria-label="Upload image"
    >
      <Image size={16} />
    </Button>
    <Button
      onClick={onToggleRecording}
      variant="soft"
      disabled={isStreaming || isProcessing}
      color={isRecording ? 'red' : undefined}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? <Square size={16} /> : <Mic size={16} />}
    </Button>
    <TextField.Root
      ref={textInputRef}
      placeholder={getInputPlaceholder(isRecording, isProcessing)}
      value={input}
      onChange={e => onInputChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={isInputDisabled(isStreaming, isRecording, isProcessing)}
      style={{ flex: 1 }}
    />
    <Select.Root
      value={selectedModel}
      onValueChange={value => onModelChange(value as LLMModel)}
      disabled={isStreaming}
    >
      <Select.Trigger style={{ minWidth: '10rem' }} />
      <Select.Content>
        {modelOptions.map(model => (
          <Select.Item key={model} value={model}>
            {formatModelLabel(model)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
    <Button
      onClick={onSend}
      disabled={isSendDisabled(isStreaming, input, uploadedImages.length)}
    >
      {isStreaming ? 'Sending...' : 'Send'}
    </Button>
  </Flex>
);

const InputArea = ({
  messages,
  suggestions,
  uploadedImages,
  input,
  isStreaming,
  selectedModel,
  modelOptions,
  fileInputRef,
  textInputRef,
  onSuggestionClick,
  onImageRemove,
  onImageUpload,
  onModelChange,
  onInputChange,
  onKeyDown,
  onSend,
  isRecording,
  isProcessing,
  speechError,
  onToggleRecording,
}: {
  messages: Message[];
  suggestions: ChatSuggestion[];
  uploadedImages: MessageImage[];
  input: string;
  isStreaming: boolean;
  selectedModel: LLMModel;
  modelOptions: LLMModel[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  textInputRef: React.RefObject<HTMLInputElement>;
  onSuggestionClick: (suggestion: ChatSuggestion) => void;
  onImageRemove: (index: number) => void;
  onImageUpload: (files: FileList | null) => void;
  onModelChange: (model: LLMModel) => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  speechError: string | null;
  onToggleRecording: () => void;
}) => (
  <Flex direction="column" gap="2" style={{ flexShrink: 0 }}>
    {messages.length === 0 && suggestions.length > 0 && (
      <SuggestionsBar
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
      />
    )}
    {uploadedImages.length > 0 && (
      <ImagePreviewList images={uploadedImages} onImageRemove={onImageRemove} />
    )}
    <InputControls
      fileInputRef={fileInputRef}
      textInputRef={textInputRef}
      input={input}
      isStreaming={isStreaming}
      isRecording={isRecording}
      isProcessing={isProcessing}
      uploadedImages={uploadedImages}
      selectedModel={selectedModel}
      modelOptions={modelOptions}
      onImageUpload={onImageUpload}
      onModelChange={onModelChange}
      onToggleRecording={onToggleRecording}
      onInputChange={onInputChange}
      onKeyDown={onKeyDown}
      onSend={onSend}
    />
    {speechError && (
      <Text size="2" color="red">
        {speechError}
      </Text>
    )}
  </Flex>
);

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

const setErrorMessage = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) => {
  setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1].content = CONST_ERROR_MESSAGE;
    updated[updated.length - 1].isStreaming = false;
    return updated;
  });
};

const updateMessageContent = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  content: string,
) => {
  setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1].content = content;
    return updated;
  });
};

const finalizeMessage = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  content: string,
) => {
  setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1].content = content;
    updated[updated.length - 1].isStreaming = false;
    return updated;
  });
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
  const [uploadedImages, setUploadedImages] = useState<MessageImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<LLMModel>(DEFAULT_CHAT_MODEL);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const initialPromptProcessedRef = useRef(false);

  const {
    isRecording,
    isProcessing,
    error: transcriptionError,
    toggleRecording,
  } = useSpeechToText({
    streaming: true,
    onTranscriptUpdate: transcript => {
      setInput(transcript);
    },
  });
  const { error: textToSpeechError, speak, stop } = useTextToSpeech();

  useEffect(() => {
    if (open && initialPrompt && !initialPromptProcessedRef.current) {
      initialPromptProcessedRef.current = true;
      handleSend(initialPrompt);
    }
    if (!open) {
      initialPromptProcessedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const hasModifier = e.ctrlKey || e.metaKey;
      const eventTarget = e.target as HTMLElement | null;
      const isTypingTarget =
        eventTarget instanceof HTMLInputElement ||
        eventTarget instanceof HTMLTextAreaElement ||
        eventTarget?.isContentEditable === true;

      if (e.key.toLowerCase() === 'f' && !hasModifier && !isTypingTarget) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isFullscreen]);

  useEffect(() => {
    if (open) {
      const focusInput = () => {
        if (textInputRef.current) {
          const inputElement = textInputRef.current.querySelector('input');
          if (inputElement) {
            inputElement.focus();
          } else {
            textInputRef.current.focus();
          }
        }
      };

      setTimeout(focusInput, 150);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const availableModels =
    uploadedImages.length > 0
      ? CHAT_MODELS.filter(model => modelSupportsImageInput(model))
      : CHAT_MODELS;

  useEffect(() => {
    if (availableModels.includes(selectedModel)) return;

    setSelectedModel(availableModels[0] || DEFAULT_CHAT_MODEL);
  }, [availableModels, selectedModel]);

  useEffect(() => {
    if (!open) {
      stop();
    }
  }, [open, stop]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/'),
    );

    const newImages: MessageImage[] = await Promise.all(
      imageFiles.map(async file => ({
        data: await fileToBase64(file),
        mimeType: file.type,
      })),
    );

    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const processStreamResponse = async (
    responseBody: ReadableStream<Uint8Array>,
  ) => {
    const reader = responseBody.getReader();
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
      if (now - lastUpdate > CONST_STREAM_UPDATE_INTERVAL) {
        updateMessageContent(setMessages, accumulatedContent);
        lastUpdate = now;
      }
    }

    finalizeMessage(setMessages, accumulatedContent);
    setIsStreaming(false);
    await speak(accumulatedContent);
  };

  const sendChatRequest = async (
    compactedMessages: Message[],
    model: LLMModel,
  ) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: compactedMessages,
        systemPrompt,
        model,
      }),
      signal: abortControllerRef.current?.signal,
    });

    if (!response.ok || !response.body) {
      setErrorMessage(setMessages);
      setIsStreaming(false);
      return;
    }

    await processStreamResponse(response.body);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if ((!textToSend.trim() && uploadedImages.length === 0) || isStreaming)
      return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setUploadedImages([]);
    setIsStreaming(true);
    stop();

    const compactedMessages = compactConversation(updatedMessages);
    abortControllerRef.current = new AbortController();

    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages([...compactedMessages, assistantMessage]);

    await sendChatRequest(compactedMessages, selectedModel);
  };

  const handleSuggestionClick = async (suggestion: ChatSuggestion) => {
    if (isStreaming) return;

    let promptToUse = suggestion.prompt;

    if (suggestion.onClick) {
      const result = await suggestion.onClick();
      if (result && typeof result === 'object' && 'prompt' in result) {
        promptToUse = result.prompt;
      } else {
        return;
      }
    }

    if (!promptToUse) return;

    const userMessage: Message = {
      role: 'user',
      content: promptToUse,
      displayContent: suggestion.title,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    stop();

    const compactedMessages = compactConversation(updatedMessages);
    abortControllerRef.current = new AbortController();

    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages([...compactedMessages, assistantMessage]);

    await sendChatRequest(compactedMessages, selectedModel);
  };

  const handleClear = () => {
    stop();
    setMessages([]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
          height: isFullscreen ? '95vh' : '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          transition: 'max-width 0.3s ease, height 0.3s ease',
        }}
      >
        <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
          <DialogHeader
            isFullscreen={isFullscreen}
            onClear={handleClear}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </div>

        <Flex
          direction="column"
          gap="3"
          style={{
            flex: 1,
            overflow: 'hidden',
            padding: '1rem 1.5rem 1.5rem 1.5rem',
          }}
        >
          <MessagesArea
            messages={messages}
            isDragging={isDragging}
            scrollRef={scrollRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          <InputArea
            messages={messages}
            suggestions={suggestions}
            uploadedImages={uploadedImages}
            input={input}
            isStreaming={isStreaming}
            selectedModel={selectedModel}
            modelOptions={availableModels}
            fileInputRef={fileInputRef}
            textInputRef={textInputRef}
            onSuggestionClick={handleSuggestionClick}
            onImageRemove={index =>
              setUploadedImages(prev => prev.filter((_, i) => i !== index))
            }
            onImageUpload={handleImageUpload}
            onModelChange={setSelectedModel}
            onInputChange={setInput}
            onKeyDown={handleKeyDown}
            onSend={() => handleSend()}
            isRecording={isRecording}
            isProcessing={isProcessing}
            speechError={transcriptionError || textToSpeechError}
            onToggleRecording={toggleRecording}
          />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
