import { Fragment, ReactNode } from 'react';
import { TextObject } from './demo.types';

const MENTION = /<@(\w+)>/;
const INLINE = /\*([^*\n]+)\*|(^|[\s(|])_([^_\n]+)_/g;
const MRKDWN = 'mrkdwn';

const renderInline = (text: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    if (match[1] !== undefined) {
      nodes.push(<b key={start}>{match[1]}</b>);
    } else {
      nodes.push(match[2], <i key={start}>{match[3]}</i>);
    }
    cursor = start + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
};

const renderLines = (text: string, markup: boolean): ReactNode[] =>
  text
    .split('\n')
    .flatMap((line, index) => [
      ...(index > 0 ? [<br key={`br-${index}`} />] : []),
      ...(markup ? renderInline(line) : [line]),
    ]);

type SlackTextProps = {
  text: string;
  markup?: boolean;
  userName: (userId: string) => string;
};

// Renders `<@id>` mentions as chips and, for mrkdwn, `*bold*` and `_italic_`.
export const SlackText = ({
  text,
  markup = false,
  userName,
}: SlackTextProps) => (
  <>
    {text.split(new RegExp(MENTION.source)).map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} className="mention">
          @{userName(part)}
        </span>
      ) : (
        <Fragment key={index}>{renderLines(part, markup)}</Fragment>
      ),
    )}
  </>
);

export const isMarkup = (text?: TextObject) => text?.type === MRKDWN;
