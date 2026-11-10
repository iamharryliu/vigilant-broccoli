'use client';
import { Trash2 } from 'lucide-react';
import {
  Button,
  ChatSendButton,
  IconButton,
  SpeechToTextToggleButton,
  Textarea,
  Text,
} from '@vigilant-broccoli/react-lib';
import { SLASH_PREFIX } from '../../constants/chatbot.consts';
import type { ChatCommand, Message, MessageImage } from './chatbot.types';

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
      variant="destructive"
      size="icon"
      onClick={onRemove}
      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-1"
    >
      <Trash2 size={12} />
    </Button>
  </div>
);

const SuggestionsBar = ({
  commands,
  onCommandRun,
}: {
  commands: ChatCommand[];
  onCommandRun: (name: string) => void;
}) => (
  <div className="flex gap-2 flex-wrap items-center">
    {commands.map(command => (
      <Button
        key={command.name}
        onClick={() => onCommandRun(command.name)}
        variant="secondary"
      >
        {command.label}
      </Button>
    ))}
  </div>
);

export const parseSlashQuery = (input: string): string | null => {
  if (!input.startsWith(SLASH_PREFIX)) return null;
  const firstSpace = input.indexOf(' ');
  if (firstSpace !== -1) return null;
  return input.slice(SLASH_PREFIX.length);
};

export const filterCommandsByQuery = (
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
  <div className="flex gap-2 flex-wrap items-center">
    {images.map((img, index) => (
      <ImagePreview
        key={index}
        img={img}
        index={index}
        onRemove={() => onImageRemove(index)}
      />
    ))}
  </div>
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
  isRecording: boolean,
  isProcessing: boolean,
): boolean => isRecording || isProcessing;

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
  onImageUpload,
  onToggleRecording,
  onInputChange,
  onKeyDown,
  onSend,
  onStop,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textInputRef: React.RefObject<HTMLTextAreaElement | null>;
  input: string;
  isStreaming: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  uploadedImages: MessageImage[];
  onImageUpload: (files: FileList | null) => void;
  onToggleRecording: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onStop: () => void;
}) => (
  <div className="flex gap-2 items-end">
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
      variant="ghost"
      onClick={() => fileInputRef.current?.click()}
      disabled={isStreaming || isRecording}
      aria-label="Upload image"
    />
    <SpeechToTextToggleButton
      variant="ghost"
      isRecording={isRecording}
      isDisabled={isStreaming || isProcessing}
      onToggle={onToggleRecording}
    />
    <Textarea
      ref={textInputRef}
      placeholder={getInputPlaceholder(isRecording, isProcessing)}
      value={input}
      onChange={e => onInputChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={isInputDisabled(isRecording, isProcessing)}
      rows={1}
      className="flex-1 min-h-[2.25rem] max-h-48"
    />
    <ChatSendButton
      variant="ghost"
      isStreaming={isStreaming}
      isDisabled={isSendDisabled(false, input, uploadedImages.length)}
      onSend={onSend}
      onStop={onStop}
    />
  </div>
);

export const InputArea = ({
  messages,
  suggestionCommands,
  slashMenuCommands,
  slashMenuHighlightedIndex,
  onSlashMenuSelect,
  uploadedImages,
  input,
  isStreaming,
  fileInputRef,
  textInputRef,
  onCommandRun,
  onImageRemove,
  onImageUpload,
  onInputChange,
  onKeyDown,
  onSend,
  onStop,
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
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textInputRef: React.RefObject<HTMLTextAreaElement | null>;
  onCommandRun: (name: string) => void;
  onImageRemove: (index: number) => void;
  onImageUpload: (files: FileList | null) => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onStop: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  speechError: string | null;
  onToggleRecording: () => void;
}) => (
  <div className="flex flex-col gap-2" style={{ flexShrink: 0 }}>
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
      onImageUpload={onImageUpload}
      onToggleRecording={onToggleRecording}
      onInputChange={onInputChange}
      onKeyDown={onKeyDown}
      onSend={onSend}
      onStop={onStop}
    />
    {speechError && (
      <Text size="2" color="red">
        {speechError}
      </Text>
    )}
  </div>
);
