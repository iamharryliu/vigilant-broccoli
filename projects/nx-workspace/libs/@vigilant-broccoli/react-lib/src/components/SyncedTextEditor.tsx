import { CSSProperties } from 'react';
import { Text } from '@radix-ui/themes';

const LOADING_LABEL = 'Loading...';
const SAVING_LABEL = 'Saving...';
const DEFAULT_PLACEHOLDER = 'Quick notes...';

const styles = {
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1px solid var(--gray-6)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    backgroundColor: 'var(--color-background)',
    color: 'var(--gray-12)',
    outline: 'none',
    minHeight: '200px',
  },
} as const;

interface SyncedTextEditorProps {
  title: string;
  content: string;
  onChange: (content: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  placeholder?: string;
  style?: CSSProperties;
}

const statusLabel = (
  isLoading: boolean,
  isSaving: boolean,
  lastSaved: Date | null,
) => {
  if (isLoading) return LOADING_LABEL;
  if (isSaving) return SAVING_LABEL;
  if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`;
  return '';
};

export const SyncedTextEditor = ({
  title,
  content,
  onChange,
  isSaving,
  isLoading,
  lastSaved,
  placeholder = DEFAULT_PLACEHOLDER,
  style,
}: SyncedTextEditorProps) => (
  <div
    className="flex flex-col gap-2"
    style={{ display: 'flex', flexDirection: 'column', ...style }}
  >
    <div className="flex justify-between items-center">
      <Text size="2" weight="bold">
        {title}
      </Text>
      <Text size="1" color="gray">
        {statusLabel(isLoading, isSaving, lastSaved)}
      </Text>
    </div>
    <textarea
      value={content}
      onChange={e => onChange(e.target.value)}
      disabled={isLoading}
      placeholder={isLoading ? LOADING_LABEL : placeholder}
      style={{
        ...styles.textarea,
        opacity: isLoading ? 0.6 : 1,
        cursor: isLoading ? 'wait' : 'text',
      }}
    />
  </div>
);
