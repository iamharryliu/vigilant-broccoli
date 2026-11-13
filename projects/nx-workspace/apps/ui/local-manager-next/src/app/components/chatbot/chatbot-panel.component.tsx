'use client';
import { useState, useRef, useEffect } from 'react';
import {
  LLMModel,
  modelSupportsImageInput,
} from '@vigilant-broccoli/common-js';
import { useSpeechToText, useTextToSpeech } from '@vigilant-broccoli/react-lib';
import { useReplySpeech } from '@vigilant-broccoli/chatbot';
import { authFetch } from '../../../../libs/auth';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { useChatStream } from '../../hooks/useChatStream';
import { useCalendarDrafts } from '../../hooks/useCalendarDrafts';
import { useTaskDrafts } from '../../hooks/useTaskDrafts';
import {
  CHAT_MODELS,
  COMMAND_DESCRIPTION,
  COMMAND_LABEL,
  COMMAND_NAME,
  DEFAULT_CHAT_MODEL,
  HELP_HEADING,
  KEY,
} from '../../constants/chatbot.consts';
import {
  findRecentLink,
  isCalendarLinkMessage,
} from '../../utils/chat-messages.utils';
import {
  filterCommandsByQuery,
  InputArea,
  parseInlineSlashCommand,
  parseSlashQuery,
} from './chat-input.component';
import { MessagesArea } from './chat-messages.component';
import type {
  ChatCommand,
  ChatSuggestion,
  Message,
  MessageImage,
} from './chatbot.types';

interface ChatbotPanelProps {
  initialPrompt?: string;
  systemPrompt?: string;
  suggestions?: ChatSuggestion[];
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
  useKnowledgeBase: boolean;
  speakReplies: boolean;
  voiceId: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ChatbotPanel = ({
  initialPrompt,
  systemPrompt,
  suggestions = [],
  initialMessages,
  onMessagesChange,
  selectedModel,
  onModelChange,
  useKnowledgeBase,
  speakReplies,
  voiceId,
}: ChatbotPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const onMessagesChangeRef = useRef(onMessagesChange);
  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange;
  }, [onMessagesChange]);
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    onMessagesChangeRef.current?.(messages);
  }, [messages]);
  const [input, setInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<MessageImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [slashMenuHighlightedIndex, setSlashMenuHighlightedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const initialPromptProcessedRef = useRef(false);

  const {
    isRecording,
    isProcessing,
    error: transcriptionError,
    toggleRecording,
  } = useSpeechToText({
    authFetch,
    streaming: true,
    onTranscriptUpdate: transcript => {
      setInput(transcript);
    },
  });
  const {
    error: textToSpeechError,
    speak,
    stop: stopSpeaking,
  } = useTextToSpeech({ authFetch, endpoint: API_ENDPOINTS.TEXT_TO_SPEECH });
  const replySpeech = useReplySpeech({
    speakReplies,
    voiceId,
    speak,
    stop: stopSpeaking,
  });

  const { isStreaming, runChat, runSuggestion, stopStreaming } = useChatStream({
    setMessages,
    systemPrompt,
    selectedModel,
    useKnowledgeBase,
    speak: replySpeech.onReplyComplete,
    stopSpeaking: replySpeech.onInterrupt,
  });
  const { parseEvent, createEvent, cancelEvent } =
    useCalendarDrafts(setMessages);
  const { parseTasks, createTasks, cancelTasks } = useTaskDrafts(setMessages);

  useEffect(() => {
    if (initialPrompt && !initialPromptProcessedRef.current) {
      initialPromptProcessedRef.current = true;
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    const timeout = setTimeout(() => textInputRef.current?.focus(), 150);
    return () => clearTimeout(timeout);
  }, []);

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

    onModelChange(availableModels[0] || DEFAULT_CHAT_MODEL);
  }, [availableModels, selectedModel, onModelChange]);

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

  // Slash commands run on the input text; a bare "/command" is not content.
  const takeCommandInput = (textOverride?: unknown) => {
    const text =
      typeof textOverride === 'string'
        ? textOverride
        : parseSlashQuery(input) !== null
          ? ''
          : input;
    const images = uploadedImages;
    if (!text.trim() && images.length === 0) return null;
    setInput('');
    setUploadedImages([]);
    return { text, images };
  };

  const handleParseEvent = async (textOverride?: unknown) => {
    const command = takeCommandInput(textOverride);
    if (command) await parseEvent(command.text, command.images);
  };

  const handleParseTasks = async (textOverride?: unknown) => {
    const command = takeCommandInput(textOverride);
    if (command) await parseTasks(command.text, command.images);
  };

  const inlineCommandHandlers: Record<string, (text: string) => Promise<void>> =
    {
      [COMMAND_NAME.CALENDAR]: handleParseEvent,
      [COMMAND_NAME.TASKS]: handleParseTasks,
    };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if ((!textToSend.trim() && uploadedImages.length === 0) || isStreaming)
      return;
    if (!messageText && parseSlashQuery(input) !== null) return;
    const inlineCommand = messageText ? null : parseInlineSlashCommand(input);
    const inlineHandler = inlineCommand
      ? inlineCommandHandlers[inlineCommand.name]
      : undefined;
    if (inlineCommand && inlineHandler) {
      await inlineHandler(inlineCommand.text);
      return;
    }
    if (!messageText && isCalendarLinkMessage(input)) {
      await handleParseEvent();
      return;
    }
    const recentLink = messageText ? null : findRecentLink(messages, input);
    if (recentLink) {
      await handleParseEvent(`${input.trim()}\n${recentLink}`);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
    };
    setInput('');
    setUploadedImages([]);
    await runChat([...messages, userMessage]);
  };

  const handleRegenerate = async () => {
    if (isStreaming) return;
    await runChat(messages.slice(0, -1));
  };

  const handleEditResend = async (messageIndex: number, text: string) => {
    if (isStreaming) return;
    await runChat([
      ...messages.slice(0, messageIndex),
      { ...messages[messageIndex], content: text },
    ]);
  };

  const suggestionAsCommand = (suggestion: ChatSuggestion): ChatCommand => ({
    name: suggestion.title,
    label: suggestion.title,
    description: suggestion.title,
    showInSuggestions: true,
    handler: () => runSuggestion(messages, suggestion),
  });

  const commands: ChatCommand[] = [
    {
      name: COMMAND_NAME.HELP,
      label: COMMAND_LABEL[COMMAND_NAME.HELP],
      description: COMMAND_DESCRIPTION[COMMAND_NAME.HELP],
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
      description: COMMAND_DESCRIPTION[COMMAND_NAME.CALENDAR],
      showInSuggestions: false,
      handler: handleParseEvent,
    },
    {
      name: COMMAND_NAME.TASKS,
      label: COMMAND_LABEL[COMMAND_NAME.TASKS],
      description: COMMAND_DESCRIPTION[COMMAND_NAME.TASKS],
      showInSuggestions: false,
      handler: handleParseTasks,
    },
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
    <div
      className="flex flex-col"
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        className="flex flex-col gap-3"
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '1.5rem',
        }}
      >
        <MessagesArea
          messages={messages}
          isStreaming={isStreaming}
          isDragging={isDragging}
          scrollRef={scrollRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onEventCreate={createEvent}
          onEventCancel={cancelEvent}
          onTasksCreate={createTasks}
          onTasksCancel={cancelTasks}
          onRegenerate={handleRegenerate}
          onEditSave={handleEditResend}
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
          fileInputRef={fileInputRef}
          textInputRef={textInputRef}
          onCommandRun={runCommand}
          onImageRemove={index =>
            setUploadedImages(prev => prev.filter((_, i) => i !== index))
          }
          onImageUpload={handleImageUpload}
          onInputChange={setInput}
          onKeyDown={handleKeyDown}
          onSend={() => handleSend()}
          onStop={stopStreaming}
          isRecording={isRecording}
          isProcessing={isProcessing}
          speechError={transcriptionError || textToSpeechError}
          onToggleRecording={toggleRecording}
        />
      </div>
    </div>
  );
};
