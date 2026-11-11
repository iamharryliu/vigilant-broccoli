'use client';
import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Button,
  ChatSendButton,
  IconButton,
  SpeechToTextToggleButton,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import type { ChatbotImage } from './chatbot.types';

const DEFAULT_PLACEHOLDER = 'Type your message...';
const RECORDING_PLACEHOLDER = 'Recording...';
const PROCESSING_PLACEHOLDER = 'Processing...';

const ImagePreviewList = ({
  images,
  onRemove,
}: {
  images: ChatbotImage[];
  onRemove: (index: number) => void;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    {images.map((img, index) => (
      <div key={index} className="relative inline-block">
        <img
          src={`data:${img.mimeType};base64,${img.data}`}
          alt={`Preview ${index + 1}`}
          className="h-20 w-20 rounded-lg object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(index)}
          className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-1"
          aria-label="Remove image"
        >
          <Trash2 size={12} />
        </Button>
      </div>
    ))}
  </div>
);

// Voice input state, e.g. from react-lib's useSpeechToText.
export interface ChatInputSpeechProps {
  isRecording: boolean;
  isProcessing: boolean;
  error?: string | null;
  onToggleRecording: () => void;
}

const getPlaceholder = (
  placeholder: string,
  speech: ChatInputSpeechProps | undefined,
) => {
  if (speech?.isRecording) return RECORDING_PLACEHOLDER;
  if (speech?.isProcessing) return PROCESSING_PLACEHOLDER;
  return placeholder;
};

const isSpeechBusy = (speech: ChatInputSpeechProps | undefined) =>
  Boolean(speech?.isRecording || speech?.isProcessing);

const getDefaultUploadDisabled = (
  isStreaming: boolean,
  speech: ChatInputSpeechProps | undefined,
) => isStreaming || Boolean(speech?.isRecording);

const SpeechToggle = ({
  speech,
  isStreaming,
}: {
  speech: ChatInputSpeechProps;
  isStreaming: boolean;
}) => (
  <SpeechToTextToggleButton
    variant="ghost"
    isRecording={speech.isRecording}
    isDisabled={isStreaming || speech.isProcessing}
    onToggle={speech.onToggleRecording}
  />
);

const SpeechError = ({ error }: { error?: string | null }) =>
  error ? (
    <Text size="2" color="red">
      {error}
    </Text>
  ) : null;

export interface ChatInputAreaProps {
  uploadedImages: ChatbotImage[];
  input: string;
  isStreaming: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textInputRef: React.RefObject<HTMLTextAreaElement | null>;
  onImageRemove: (index: number) => void;
  onImageUpload: (files: FileList | null) => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onStop: () => void;
  placeholder?: string;
  isInputDisabled?: boolean;
  isUploadDisabled?: boolean;
  // Rendered above the image previews, e.g. suggestions or a command menu.
  aboveInput?: ReactNode;
  // Rendered before the text box, e.g. a microphone toggle.
  leadingControls?: ReactNode;
  // Rendered below the controls, e.g. a hint or an error.
  footer?: ReactNode;
  // Adds a microphone toggle and its error; omit for text-only input.
  speech?: ChatInputSpeechProps;
}

export const ChatInputArea = ({
  uploadedImages,
  input,
  isStreaming,
  fileInputRef,
  textInputRef,
  onImageRemove,
  onImageUpload,
  onInputChange,
  onKeyDown,
  onSend,
  onStop,
  placeholder = DEFAULT_PLACEHOLDER,
  speech,
  isInputDisabled = false,
  isUploadDisabled,
  aboveInput,
  leadingControls,
  footer,
}: ChatInputAreaProps) => (
  <div className="flex shrink-0 flex-col gap-2">
    {aboveInput}
    {uploadedImages.length > 0 && (
      <ImagePreviewList images={uploadedImages} onRemove={onImageRemove} />
    )}
    <div className="flex items-end gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => onImageUpload(e.target.files)}
        className="hidden"
      />
      <IconButton
        icon="image"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={
          isUploadDisabled ?? getDefaultUploadDisabled(isStreaming, speech)
        }
        aria-label="Upload image"
      />
      {speech && <SpeechToggle speech={speech} isStreaming={isStreaming} />}
      {leadingControls}
      <Textarea
        ref={textInputRef}
        placeholder={getPlaceholder(placeholder, speech)}
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isInputDisabled || isSpeechBusy(speech)}
        rows={1}
        className="max-h-48 min-h-[2.25rem] flex-1"
      />
      <ChatSendButton
        variant="ghost"
        isStreaming={isStreaming}
        isDisabled={!input.trim() && uploadedImages.length === 0}
        onSend={onSend}
        onStop={onStop}
      />
    </div>
    <SpeechError error={speech?.error} />
    {footer}
  </div>
);

export const ChatInputHint = ({ children }: { children: ReactNode }) => (
  <Text size="1" color="gray">
    {children}
  </Text>
);
