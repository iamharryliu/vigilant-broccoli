import { CopyButton } from './CopyButton';

const DEFAULT_MAX_LENGTH = 20;

const truncateMiddle = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  const half = Math.floor((maxLength - 3) / 2);
  return `${text.slice(0, half)}...${text.slice(-half)}`;
};

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  text: {
    fontFamily: 'monospace',
    padding: '4px 8px',
    backgroundColor: 'var(--gray-3)',
    borderRadius: '4px',
    fontSize: '0.875rem',
  },
  skeleton: {
    width: '120px',
    height: '24px',
    backgroundColor: 'var(--gray-3)',
    borderRadius: '4px',
  },
} as const;

export const MonospaceText = ({
  text,
  disabled,
  loading,
  truncate = true,
  maxLength = DEFAULT_MAX_LENGTH,
}: {
  text: string;
  disabled?: boolean;
  loading?: boolean;
  truncate?: boolean;
  maxLength?: number;
}) => (
  <div style={styles.wrapper}>
    {loading ? (
      <span style={styles.skeleton} />
    ) : (
      <span style={styles.text}>
        {truncate ? truncateMiddle(text, maxLength) : text}
      </span>
    )}
    <CopyButton text={text} disabled={disabled ?? loading} />
  </div>
);
