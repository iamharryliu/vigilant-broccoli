'use client';
import { useEffect, useRef, useState } from 'react';
import {
  modelSupportsImageInput,
  type LLMModel,
} from '@vigilant-broccoli/common-js';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL, KEY } from '../app.const';
import type { Message, MessageImage } from '../chat.types';
import { useChatStream } from '../hooks/useChatStream';
import { InputArea } from './ChatInput';
import { MessagesArea } from './ChatMessages';

interface ChatPanelProps {
  initialMessages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
  useKnowledgeBase: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ChatPanel = ({
  initialMessages,
  onMessagesChange,
  selectedModel,
  onModelChange,
  useKnowledgeBase,
}: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<MessageImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const onMessagesChangeRef = useRef(onMessagesChange);
  const hasMountedRef = useRef(false);

  const { isStreaming, runChat, stopStreaming } = useChatStream({
    setMessages,
    selectedModel,
    useKnowledgeBase,
  });

  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange;
  }, [onMessagesChange]);

  // Skip the mount run: it would re-save the history just loaded.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    onMessagesChangeRef.current(messages);
  }, [messages]);

  useEffect(() => {
    const timeout = setTimeout(() => textInputRef.current?.focus(), 150);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Attached images need a vision-capable model.
  useEffect(() => {
    if (uploadedImages.length === 0) return;
    if (modelSupportsImageInput(selectedModel)) return;
    onModelChange(
      CHAT_MODELS.find(modelSupportsImageInput) ?? DEFAULT_CHAT_MODEL,
    );
  }, [uploadedImages, selectedModel, onModelChange]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    const images = await Promise.all(
      Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(async file => ({
          data: await fileToBase64(file),
          mimeType: file.type,
        })),
    );
    setUploadedImages(prev => [...prev, ...images]);
  };

  const handleSend = async () => {
    if ((!input.trim() && uploadedImages.length === 0) || isStreaming) return;
    const userMessage: Message = {
      role: 'user',
      content: input,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEY.ENTER && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-hidden p-6">
      <MessagesArea
        messages={messages}
        isStreaming={isStreaming}
        isDragging={isDragging}
        scrollRef={scrollRef}
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          handleImageUpload(e.dataTransfer.files);
        }}
        onRegenerate={handleRegenerate}
        onEditSave={handleEditResend}
      />
      <InputArea
        uploadedImages={uploadedImages}
        input={input}
        isStreaming={isStreaming}
        fileInputRef={fileInputRef}
        textInputRef={textInputRef}
        onImageRemove={index =>
          setUploadedImages(prev => prev.filter((_, i) => i !== index))
        }
        onImageUpload={handleImageUpload}
        onInputChange={setInput}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        onStop={stopStreaming}
      />
    </div>
  );
};
