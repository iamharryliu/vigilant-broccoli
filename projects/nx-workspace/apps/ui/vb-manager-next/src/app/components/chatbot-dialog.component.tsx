'use client';

import {
  Dialog,
  Flex,
  Text,
  Button,
  TextField,
  TextArea,
  ScrollArea,
  Card,
  Select,
} from '@radix-ui/themes';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trash2 } from 'lucide-react';
import {
  CloseButton,
  IconButton,
  UserAvatar,
} from '@vigilant-broccoli/react-lib';
import { SpeechToTextButton } from './llm/SpeechToTextButton';
import {
  LLM_MODEL,
  LLM_MODELS,
  LLMModel,
  modelSupportsImageInput,
  modelSupportsImageOutput,
} from '@vigilant-broccoli/common-js';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import {
  EventDraft,
  EventDraftCard,
  EventDraftStatus,
} from './event-draft-card.component';
import {
  TaskDraftItem,
  TaskListDraftCard,
  TaskListDraftStatus,
} from './task-list-draft-card.component';
import { getLocalTimeZone } from '@vigilant-broccoli/common-browser';

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
  eventDraft?: EventDraft;
  eventStatus?: EventDraftStatus;
  eventError?: string;
  eventLink?: string;
  taskDrafts?: TaskDraftItem[];
  taskStatus?: TaskListDraftStatus;
  taskError?: string;
  taskCreatedSummary?: string;
}

const COMMAND_NAME = {
  HELP: 'help',
  CALENDAR: 'calendar',
  TASKS: 'tasks',
} as const;

const COMMAND_LABEL = {
  [COMMAND_NAME.HELP]: 'Show available commands',
  [COMMAND_NAME.CALENDAR]: 'Create calendar event',
  [COMMAND_NAME.TASKS]: 'Create tasks',
} as const;

interface ChatCommand {
  name: string;
  label: string;
  description: string;
  showInSuggestions: boolean;
  handler: () => Promise<void> | void;
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

interface ChatbotPanelProps {
  initialPrompt?: string;
  systemPrompt?: string;
  suggestions?: ChatSuggestion[];
  variant?: 'dialog' | 'page';
  isOpen?: boolean;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MAX_MESSAGES = 20;

const CONST_ERROR_MESSAGE = 'Error: Failed to get response';
const CONST_STREAM_UPDATE_INTERVAL = 50;
const DEFAULT_CHAT_MODEL = LLM_MODEL.GPT_4O;

const ASSISTANT_NAME = 'Jarvis';

const TASKS_PARSING_MESSAGE = 'Parsing tasks...';
const TASKS_PARSE_ERROR_MESSAGE = 'Failed to parse tasks';
const TASKS_CREATE_ERROR_MESSAGE = 'Failed to create tasks';
const TASKS_CREATE_LIST_ERROR_MESSAGE = 'Failed to create task list';
const TASKS_CANCELLED_MESSAGE = 'Tasks cancelled.';
const EVENT_CANCELLED_MESSAGE = 'Event cancelled.';

const TASKS_API_PATH = '/api/tasks';
const TASKS_LISTS_API_PATH = '/api/tasks/lists';
const TASKS_PARSE_API_PATH = '/api/tasks/parse-image';

const KEY = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  TAB: 'Tab',
  ESCAPE: 'Escape',
} as const;

const HELP_HEADING = '**Available commands**';
const HELP_COMMAND_DESCRIPTION = 'List the available slash commands.';
const CALENDAR_COMMAND_DESCRIPTION =
  'Parse text/images from the input into a calendar event draft.';
const TASKS_COMMAND_DESCRIPTION =
  'Extract a Google Tasks list from the input text and/or attached images.';
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

  return (
    <>{message.content && <ReactMarkdown>{message.content}</ReactMarkdown>}</>
  );
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

const PanelHeader = ({
  variant,
  isFullscreen,
  onClear,
  onToggleFullscreen,
}: {
  variant: 'dialog' | 'page';
  isFullscreen: boolean;
  onClear: () => void;
  onToggleFullscreen: () => void;
}) => (
  <Flex justify="between" align="center" style={{ minHeight: '2.5rem' }}>
    <Flex gap="2" align="center">
      <UserAvatar name={ASSISTANT_NAME} />
      {variant === 'dialog' ? (
        <Dialog.Title style={{ margin: 0 }}>{ASSISTANT_NAME}</Dialog.Title>
      ) : (
        <Text size="5" weight="bold">
          {ASSISTANT_NAME}
        </Text>
      )}
    </Flex>
    <Flex gap="6" align="center">
      <IconButton
        icon="rotate-ccw"
        variant="ghost"
        onClick={onClear}
        aria-label="Clear conversation"
      />
      {variant === 'dialog' && (
        <>
          <IconButton
            icon={isFullscreen ? 'minimize' : 'maximize'}
            variant="ghost"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          />
          <Dialog.Close>
            <CloseButton aria-label="Close" />
          </Dialog.Close>
        </>
      )}
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
  onEventCreate,
  onEventCancel,
  onTasksCreate,
  onTasksCancel,
}: {
  messages: Message[];
  isDragging: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onEventCreate: (messageIndex: number, draft: EventDraft) => void;
  onEventCancel: (messageIndex: number) => void;
  onTasksCreate: (
    messageIndex: number,
    params: {
      tasks: TaskDraftItem[];
      targetListId?: string;
      newListTitle?: string;
    },
  ) => void;
  onTasksCancel: (messageIndex: number) => void;
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
            {message.eventDraft && (
              <EventDraftCard
                draft={message.eventDraft}
                status={message.eventStatus || 'draft'}
                errorMessage={message.eventError}
                eventLink={message.eventLink}
                onCreate={draft => onEventCreate(index, draft)}
                onCancel={() => onEventCancel(index)}
              />
            )}
            {message.taskDrafts && (
              <TaskListDraftCard
                drafts={message.taskDrafts}
                status={message.taskStatus || 'draft'}
                errorMessage={message.taskError}
                createdSummary={message.taskCreatedSummary}
                onCreate={params => onTasksCreate(index, params)}
                onCancel={() => onTasksCancel(index)}
              />
            )}
          </Card>
        ))}
      </Flex>
    </ScrollArea>
  </div>
);

const SuggestionsBar = ({
  commands,
  onCommandRun,
}: {
  commands: ChatCommand[];
  onCommandRun: (name: string) => void;
}) => (
  <Flex direction="row" gap="2" wrap="wrap" align="center">
    {commands.map(command => (
      <Button
        key={command.name}
        onClick={() => onCommandRun(command.name)}
        variant="soft"
        size="2"
      >
        {command.label}
      </Button>
    ))}
  </Flex>
);

const SLASH_PREFIX = '/';

const parseSlashQuery = (input: string): string | null => {
  if (!input.startsWith(SLASH_PREFIX)) return null;
  const firstSpace = input.indexOf(' ');
  if (firstSpace !== -1) return null;
  return input.slice(SLASH_PREFIX.length);
};

const filterCommandsByQuery = (
  commands: ChatCommand[],
  query: string,
): ChatCommand[] => {
  const lower = query.toLowerCase();
  return commands.filter(
    c =>
      c.name.toLowerCase().startsWith(lower) ||
      c.label.toLowerCase().includes(lower),
  );
};

const SlashMenu = ({
  commands,
  highlightedIndex,
  onSelect,
}: {
  commands: ChatCommand[];
  highlightedIndex: number;
  onSelect: (name: string) => void;
}) => (
  <div
    style={{
      border: '1px solid var(--gray-6)',
      borderRadius: '0.5rem',
      backgroundColor: 'var(--color-panel-solid)',
      padding: '0.25rem',
      maxHeight: '12rem',
      overflowY: 'auto',
    }}
  >
    {commands.map((command, index) => (
      <button
        key={command.name}
        type="button"
        onMouseDown={e => {
          e.preventDefault();
          onSelect(command.name);
        }}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '0.375rem 0.5rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer',
          backgroundColor:
            index === highlightedIndex ? 'var(--accent-3)' : 'transparent',
        }}
      >
        <Text size="2" weight="medium">
          /{command.name}
        </Text>
        <Text
          size="1"
          color="gray"
          style={{ display: 'block', marginTop: '0.125rem' }}
        >
          {command.description}
        </Text>
      </button>
    ))}
  </div>
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
  textInputRef: React.RefObject<HTMLTextAreaElement>;
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
  <Flex gap="2" align="end">
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={e => onImageUpload(e.target.files)}
      style={{ display: 'none' }}
    />
    <IconButton
      icon="image"
      variant="outline"
      onClick={() => fileInputRef.current?.click()}
      disabled={isStreaming || isRecording}
      aria-label="Upload image"
    />
    <SpeechToTextButton
      isRecording={isRecording}
      isDisabled={isStreaming || isProcessing}
      onToggle={onToggleRecording}
    />
    <TextArea
      ref={textInputRef}
      placeholder={getInputPlaceholder(isRecording, isProcessing)}
      value={input}
      onChange={e => onInputChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={isInputDisabled(isStreaming, isRecording, isProcessing)}
      rows={1}
      style={{ flex: 1, minHeight: '2.25rem', maxHeight: '12rem' }}
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
    <IconButton
      icon="send-horizontal"
      variant="outline"
      onClick={onSend}
      loading={isStreaming}
      disabled={isSendDisabled(isStreaming, input, uploadedImages.length)}
      aria-label="Send message"
    />
  </Flex>
);

const InputArea = ({
  messages,
  suggestionCommands,
  slashMenuCommands,
  slashMenuHighlightedIndex,
  onSlashMenuSelect,
  uploadedImages,
  input,
  isStreaming,
  selectedModel,
  modelOptions,
  fileInputRef,
  textInputRef,
  onCommandRun,
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
  suggestionCommands: ChatCommand[];
  slashMenuCommands: ChatCommand[] | null;
  slashMenuHighlightedIndex: number;
  onSlashMenuSelect: (name: string) => void;
  uploadedImages: MessageImage[];
  input: string;
  isStreaming: boolean;
  selectedModel: LLMModel;
  modelOptions: LLMModel[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  textInputRef: React.RefObject<HTMLTextAreaElement>;
  onCommandRun: (name: string) => void;
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
    {messages.length === 0 && suggestionCommands.length > 0 && (
      <SuggestionsBar
        commands={suggestionCommands}
        onCommandRun={onCommandRun}
      />
    )}
    {slashMenuCommands && slashMenuCommands.length > 0 && (
      <SlashMenu
        commands={slashMenuCommands}
        highlightedIndex={slashMenuHighlightedIndex}
        onSelect={onSlashMenuSelect}
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

export const ChatbotPanel = ({
  initialPrompt,
  systemPrompt,
  suggestions = [],
  variant = 'dialog',
  isOpen = true,
  isFullscreen: externalFullscreen,
  onToggleFullscreen,
}: ChatbotPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = externalFullscreen ?? internalFullscreen;
  const toggleFullscreen = useCallback(() => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      setInternalFullscreen(prev => !prev);
    }
  }, [onToggleFullscreen]);
  const [uploadedImages, setUploadedImages] = useState<MessageImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<LLMModel>(DEFAULT_CHAT_MODEL);
  const [slashMenuHighlightedIndex, setSlashMenuHighlightedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
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
    if (isOpen && initialPrompt && !initialPromptProcessedRef.current) {
      initialPromptProcessedRef.current = true;
      handleSend(initialPrompt);
    }
    if (!isOpen) {
      initialPromptProcessedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    if (!isOpen || variant !== 'dialog') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const hasModifier = e.ctrlKey || e.metaKey;
      const eventTarget = e.target as HTMLElement | null;
      const isTypingTarget =
        eventTarget instanceof HTMLInputElement ||
        eventTarget instanceof HTMLTextAreaElement ||
        eventTarget?.isContentEditable === true;

      if (e.key.toLowerCase() === 'f' && !hasModifier && !isTypingTarget) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, variant, toggleFullscreen]);

  useEffect(() => {
    if (isOpen) {
      const focusInput = () => {
        textInputRef.current?.focus();
      };

      setTimeout(focusInput, 150);
    }
  }, [isOpen]);

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
    if (!isOpen) {
      stop();
    }
  }, [isOpen, stop]);

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
    if (!messageText && parseSlashQuery(input) !== null) return;

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

  const handleParseEvent = async () => {
    if (isStreaming) return;
    const inputSnapshot = parseSlashQuery(input) !== null ? '' : input;
    const imagesSnapshot = uploadedImages;
    if (!inputSnapshot.trim() && imagesSnapshot.length === 0) return;

    const userMessage: Message = {
      role: 'user',
      content: inputSnapshot,
      displayContent: COMMAND_LABEL[COMMAND_NAME.CALENDAR],
      images: imagesSnapshot.length > 0 ? imagesSnapshot : undefined,
    };
    const pendingAssistant: Message = {
      role: 'assistant',
      content: 'Parsing event...',
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, pendingAssistant]);
    setInput('');
    setUploadedImages([]);

    try {
      const response = await fetch('/api/calendar/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputSnapshot,
          images: imagesSnapshot.length > 0 ? imagesSnapshot : undefined,
          timeZone: getLocalTimeZone(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: payload.error || 'Failed to parse event',
            isStreaming: false,
          };
          return updated;
        });
        return;
      }

      const events = (payload.events || []) as EventDraft[];
      const headerContent =
        events.length === 1
          ? 'Review the event below before creating it.'
          : `Review the ${events.length} events below before creating them.`;

      setMessages(prev => {
        const withoutPending = prev.slice(0, -1);
        const eventMessages: Message[] = events.map(event => ({
          role: 'assistant',
          content: '',
          isStreaming: false,
          eventDraft: event,
          eventStatus: 'draft',
        }));
        return [
          ...withoutPending,
          {
            role: 'assistant',
            content: headerContent,
            isStreaming: false,
          },
          ...eventMessages,
        ];
      });
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content:
            error instanceof Error ? error.message : 'Failed to parse event',
          isStreaming: false,
        };
        return updated;
      });
    }
  };

  const handleEventCreate = async (messageIndex: number, draft: EventDraft) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[messageIndex] = {
        ...updated[messageIndex],
        eventDraft: draft,
        eventStatus: 'creating',
        eventError: undefined,
      };
      return updated;
    });

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: draft.summary,
          description: draft.description,
          start: draft.allDay ? draft.start.slice(0, 10) : draft.start,
          end: draft.allDay
            ? draft.end.slice(0, 10) || draft.start.slice(0, 10)
            : draft.end || draft.start,
          timeZone: draft.timeZone,
          location: draft.location,
          allDay: draft.allDay,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessages(prev => {
          const updated = [...prev];
          updated[messageIndex] = {
            ...updated[messageIndex],
            eventStatus: 'error',
            eventError: payload.error || 'Failed to create event',
          };
          return updated;
        });
        return;
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          eventStatus: 'created',
          eventLink: payload.event?.htmlLink,
        };
        return updated;
      });
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          eventStatus: 'error',
          eventError:
            error instanceof Error ? error.message : 'Failed to create event',
        };
        return updated;
      });
    }
  };

  const runParseTasks = async (
    suggestionTitle: string,
    fetchItems: () => Promise<{
      ok: boolean;
      items?: string[];
      error?: string;
    }>,
    contentSnapshot: string,
    imagesSnapshot: MessageImage[],
  ) => {
    const userMessage: Message = {
      role: 'user',
      content: contentSnapshot,
      displayContent: suggestionTitle,
      images: imagesSnapshot.length > 0 ? imagesSnapshot : undefined,
    };
    const pendingAssistant: Message = {
      role: 'assistant',
      content: TASKS_PARSING_MESSAGE,
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, pendingAssistant]);
    setInput('');
    setUploadedImages([]);

    try {
      const { ok, items, error } = await fetchItems();

      if (!ok || !items || items.length === 0) {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: error || TASKS_PARSE_ERROR_MESSAGE,
            isStreaming: false,
          };
          return updated;
        });
        return;
      }

      const tasks: TaskDraftItem[] = items.map(title => ({ title }));
      const headerContent = `Review the ${tasks.length} task${
        tasks.length === 1 ? '' : 's'
      } below and pick a Google Tasks list.`;

      setMessages(prev => {
        const withoutPending = prev.slice(0, -1);
        return [
          ...withoutPending,
          {
            role: 'assistant',
            content: headerContent,
            isStreaming: false,
            taskDrafts: tasks,
            taskStatus: 'draft',
          },
        ];
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content:
            err instanceof Error ? err.message : TASKS_PARSE_ERROR_MESSAGE,
          isStreaming: false,
        };
        return updated;
      });
    }
  };

  const handleParseTasks = async () => {
    if (isStreaming) return;
    const inputSnapshot = parseSlashQuery(input) !== null ? '' : input;
    const imagesSnapshot = uploadedImages;
    if (!inputSnapshot.trim() && imagesSnapshot.length === 0) return;

    await runParseTasks(
      COMMAND_LABEL[COMMAND_NAME.TASKS],
      async () => {
        const response = await fetch(TASKS_PARSE_API_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: inputSnapshot.trim() || undefined,
            images:
              imagesSnapshot.length > 0
                ? imagesSnapshot.map(img => ({
                    base64: img.data,
                    mimeType: img.mimeType,
                  }))
                : undefined,
          }),
        });
        const payload = await response.json();
        return {
          ok: response.ok,
          items: payload.items,
          error: payload.error,
        };
      },
      inputSnapshot,
      imagesSnapshot,
    );
  };

  const handleTasksCreate = async (
    messageIndex: number,
    params: {
      tasks: TaskDraftItem[];
      targetListId?: string;
      newListTitle?: string;
    },
  ) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[messageIndex] = {
        ...updated[messageIndex],
        taskDrafts: params.tasks,
        taskStatus: 'creating',
        taskError: undefined,
      };
      return updated;
    });

    try {
      let listId = params.targetListId;
      let listTitle: string | undefined;

      if (!listId) {
        const createListRes = await fetch(TASKS_LISTS_API_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: params.newListTitle }),
        });
        const createListPayload = await createListRes.json();
        if (!createListRes.ok) {
          throw new Error(
            createListPayload.error || TASKS_CREATE_LIST_ERROR_MESSAGE,
          );
        }
        listId = createListPayload.taskList?.id;
        listTitle = createListPayload.taskList?.title;
        if (!listId) throw new Error(TASKS_CREATE_LIST_ERROR_MESSAGE);
      }

      for (const task of params.tasks) {
        const res = await fetch(TASKS_API_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskListId: listId, title: task.title }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload.error || `Failed to create task: ${task.title}`,
          );
        }
      }

      const summary = listTitle
        ? `Created ${params.tasks.length} task${
            params.tasks.length === 1 ? '' : 's'
          } in new list "${listTitle}".`
        : `Created ${params.tasks.length} task${
            params.tasks.length === 1 ? '' : 's'
          }.`;

      setMessages(prev => {
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          taskStatus: 'created',
          taskCreatedSummary: summary,
        };
        return updated;
      });
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          taskStatus: 'error',
          taskError:
            error instanceof Error ? error.message : TASKS_CREATE_ERROR_MESSAGE,
        };
        return updated;
      });
    }
  };

  const handleTasksCancel = (messageIndex: number) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[messageIndex] = {
        ...updated[messageIndex],
        taskDrafts: undefined,
        taskStatus: undefined,
        taskError: undefined,
        content: TASKS_CANCELLED_MESSAGE,
      };
      return updated;
    });
  };

  const handleEventCancel = (messageIndex: number) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[messageIndex] = {
        ...updated[messageIndex],
        eventDraft: undefined,
        eventStatus: undefined,
        eventError: undefined,
        content: EVENT_CANCELLED_MESSAGE,
      };
      return updated;
    });
  };

  const handleSuggestionAsChat = async (suggestion: ChatSuggestion) => {
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

  const builtInCommands: ChatCommand[] = [
    {
      name: COMMAND_NAME.HELP,
      label: COMMAND_LABEL[COMMAND_NAME.HELP],
      description: HELP_COMMAND_DESCRIPTION,
      showInSuggestions: false,
      handler: () => {
        const helpBody = commands
          .map(c => `- \`/${c.name}\` — ${c.description}`)
          .join('\n');
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `${HELP_HEADING}\n\n${helpBody}`,
            isStreaming: false,
          },
        ]);
      },
    },
    {
      name: COMMAND_NAME.CALENDAR,
      label: COMMAND_LABEL[COMMAND_NAME.CALENDAR],
      description: CALENDAR_COMMAND_DESCRIPTION,
      showInSuggestions: false,
      handler: handleParseEvent,
    },
    {
      name: COMMAND_NAME.TASKS,
      label: COMMAND_LABEL[COMMAND_NAME.TASKS],
      description: TASKS_COMMAND_DESCRIPTION,
      showInSuggestions: false,
      handler: handleParseTasks,
    },
  ];

  const suggestionAsCommand = (suggestion: ChatSuggestion): ChatCommand => ({
    name: suggestion.title,
    label: suggestion.title,
    description: suggestion.title,
    showInSuggestions: true,
    handler: () => handleSuggestionAsChat(suggestion),
  });

  const commands: ChatCommand[] = [
    ...builtInCommands,
    ...suggestions.map(suggestionAsCommand),
  ];

  const suggestionCommands = commands.filter(c => c.showInSuggestions);

  const slashQuery = parseSlashQuery(input);
  const slashMenuCommands =
    slashQuery !== null ? filterCommandsByQuery(commands, slashQuery) : null;

  useEffect(() => {
    setSlashMenuHighlightedIndex(0);
  }, [slashQuery]);

  const runCommand = async (name: string) => {
    if (isStreaming) return;
    const command = commands.find(c => c.name === name);
    if (!command) return;
    await command.handler();
  };

  const handleSlashMenuSelect = async (name: string) => {
    setInput('');
    textInputRef.current?.focus();
    await runCommand(name);
  };

  const handleClear = () => {
    stop();
    setMessages([]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (slashMenuCommands && slashMenuCommands.length > 0) {
      if (e.key === KEY.ARROW_DOWN) {
        e.preventDefault();
        setSlashMenuHighlightedIndex(
          (slashMenuHighlightedIndex + 1) % slashMenuCommands.length,
        );
        return;
      }
      if (e.key === KEY.ARROW_UP) {
        e.preventDefault();
        setSlashMenuHighlightedIndex(
          (slashMenuHighlightedIndex - 1 + slashMenuCommands.length) %
            slashMenuCommands.length,
        );
        return;
      }
      if (e.key === KEY.ENTER || e.key === KEY.TAB) {
        e.preventDefault();
        const selected = slashMenuCommands[slashMenuHighlightedIndex];
        if (selected) handleSlashMenuSelect(selected.name);
        return;
      }
      if (e.key === KEY.ESCAPE) {
        e.preventDefault();
        setInput('');
        return;
      }
    }

    if (e.key === KEY.ENTER && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Flex
      direction="column"
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
        <PanelHeader
          variant={variant}
          isFullscreen={isFullscreen}
          onClear={handleClear}
          onToggleFullscreen={toggleFullscreen}
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
          onEventCreate={handleEventCreate}
          onEventCancel={handleEventCancel}
          onTasksCreate={handleTasksCreate}
          onTasksCancel={handleTasksCancel}
        />

        <InputArea
          messages={messages}
          suggestionCommands={suggestionCommands}
          slashMenuCommands={slashMenuCommands}
          slashMenuHighlightedIndex={slashMenuHighlightedIndex}
          onSlashMenuSelect={handleSlashMenuSelect}
          uploadedImages={uploadedImages}
          input={input}
          isStreaming={isStreaming}
          selectedModel={selectedModel}
          modelOptions={availableModels}
          fileInputRef={fileInputRef}
          textInputRef={textInputRef}
          onCommandRun={runCommand}
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
    </Flex>
  );
};

export const ChatbotDialog = ({
  open,
  onOpenChange,
  initialPrompt,
  systemPrompt,
  suggestions = [],
}: ChatbotDialogProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        <ChatbotPanel
          variant="dialog"
          isOpen={open}
          initialPrompt={initialPrompt}
          systemPrompt={systemPrompt}
          suggestions={suggestions}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};
