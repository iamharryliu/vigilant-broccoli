'use client';
import { Trash2 } from 'lucide-react';
import {
  Button,
  ChatSendButton,
  IconButton,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import type { MessageImage } from '../chat.types';

const PLACEHOLDER = 'Type your message...';

const ImagePreviewList = ({
  images,
  onRemove,
}: {
  images: MessageImage[];
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

export const InputArea = ({
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
}: {
  uploadedImages: MessageImage[];
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
}) => (
  <div className="flex shrink-0 flex-col gap-2">
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
        disabled={isStreaming}
        aria-label="Upload image"
      />
      <Textarea
        ref={textInputRef}
        placeholder={PLACEHOLDER}
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
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
    <Text size="1" color="gray">
      Enter to send, Shift+Enter for a new line.
    </Text>
  </div>
);
