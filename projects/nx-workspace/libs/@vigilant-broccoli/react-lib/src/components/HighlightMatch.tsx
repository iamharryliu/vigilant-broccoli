import { Fragment } from 'react';

const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;
const REGEX_FLAGS = 'ig';
const DEFAULT_MARK_CLASS =
  'bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded-sm px-0.5';

const escapeRegExp = (value: string) =>
  value.replace(REGEX_SPECIAL_CHARS, '\\$&');

interface HighlightMatchProps {
  text: string;
  query: string;
  markClassName?: string;
}

export const HighlightMatch = ({
  text,
  query,
  markClassName = DEFAULT_MARK_CLASS,
}: HighlightMatchProps) => {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmed)})`, REGEX_FLAGS),
  );
  const lowerQuery = trimmed.toLowerCase();
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === lowerQuery ? (
          <mark key={index} className={markClassName}>
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
};
