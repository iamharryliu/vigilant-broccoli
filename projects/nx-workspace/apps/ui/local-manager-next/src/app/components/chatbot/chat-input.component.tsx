'use client';
import { Button, Text } from '@vigilant-broccoli/react-lib';
import {
  ChatInputArea,
  type ChatInputAreaProps,
} from '@vigilant-broccoli/chatbot';
import { SLASH_PREFIX } from '../../constants/chatbot.consts';
import type { ChatCommand, Message } from './chatbot.types';

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

export const parseInlineSlashCommand = (
  input: string,
): { name: string; text: string } | null => {
  if (!input.startsWith(SLASH_PREFIX)) return null;
  const match = input.slice(SLASH_PREFIX.length).match(/^(\S+)\s+([\s\S]+)$/);
  return match ? { name: match[1], text: match[2].trim() } : null;
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

export const InputArea = ({
  messages,
  suggestionCommands,
  slashMenuCommands,
  slashMenuHighlightedIndex,
  onSlashMenuSelect,
  onCommandRun,
  isRecording,
  isProcessing,
  speechError,
  onToggleRecording,
  ...inputProps
}: Omit<ChatInputAreaProps, 'aboveInput' | 'speech'> & {
  messages: Message[];
  suggestionCommands: ChatCommand[];
  slashMenuCommands: ChatCommand[] | null;
  slashMenuHighlightedIndex: number;
  onSlashMenuSelect: (name: string) => void;
  onCommandRun: (name: string) => void;
  isRecording: boolean;
  isProcessing: boolean;
  speechError: string | null;
  onToggleRecording: () => void;
}) => (
  <ChatInputArea
    {...inputProps}
    speech={{
      isRecording,
      isProcessing,
      error: speechError,
      onToggleRecording,
    }}
    aboveInput={
      <>
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
      </>
    }
  />
);
