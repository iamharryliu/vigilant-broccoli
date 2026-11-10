'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Text, cn } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { CHAT_STATUS, ChatPayload, ChatStatus } from './chat-room.consts';
import { ChatRoomI18nProvider, useChatRoomTranslation } from './i18n';

const LOG_PREFIX = '[ChatPanel]';
const SENDER_PREFIX = 'user-';
const SENDER_ID_LENGTH = 4;
const ENTER_KEY = 'Enter';
const PLACEHOLDER_SENDER = '…';
const DEFAULT_LIST_CLASS = 'h-64';

const STATUS_KEY = {
  [CHAT_STATUS.CONNECTING]: 'STATUS_CONNECTING',
  [CHAT_STATUS.OPEN]: 'STATUS_OPEN',
  [CHAT_STATUS.CLOSED]: 'STATUS_CLOSED',
} as const;

const randomSender = () =>
  `${SENDER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + SENDER_ID_LENGTH)}`;

export interface ChatPanelProps {
  status: ChatStatus;
  messages: ChatPayload[];
  onSend: (payload: ChatPayload) => Promise<void>;
  description?: string;
  // Display name for this client. Omitted, a random `user-xxxx` is picked
  // after mount so server and client renders match.
  sender?: string;
  listClassName?: string;
}

function ChatPanelContent({
  status,
  messages,
  onSend,
  description,
  sender: fixedSender,
  listClassName = DEFAULT_LIST_CLASS,
}: ChatPanelProps) {
  const { t } = useChatRoomTranslation();
  const [draft, setDraft] = useState('');
  const [randomName, setRandomName] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const sender = fixedSender ?? randomName;

  useEffect(() => {
    if (!fixedSender) setRandomName(randomSender());
  }, [fixedSender]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !sender || sending) return;
    setSending(true);
    setDraft('');
    try {
      await onSend({ text, sender, ts: Date.now() });
    } catch (err) {
      console.error(`${LOG_PREFIX} publish failed`, err);
      setDraft(text);
      toast.error(t('SEND_FAILED'));
    } finally {
      setSending(false);
    }
  };

  const canSend = status === CHAT_STATUS.OPEN && !sending;

  return (
    <div className="flex flex-col gap-3">
      {description && (
        <Text size="2" color="gray">
          {description}
        </Text>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          {t('YOU')} <strong>{sender || PLACEHOLDER_SENDER}</strong>
        </span>
        <span>·</span>
        <span>
          {t('STATUS')} <strong>{t(STATUS_KEY[status])}</strong>
        </span>
      </div>
      <div
        ref={listRef}
        className={cn(
          'overflow-y-auto rounded border border-border bg-card p-3 flex flex-col gap-2',
          listClassName,
        )}
      >
        {messages.length === 0 ? (
          <span className="text-muted-foreground text-sm">{t('EMPTY')}</span>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm break-words">
              <span
                className={
                  m.sender === sender
                    ? 'font-semibold text-blue-700 dark:text-blue-400'
                    : 'font-semibold text-foreground'
                }
              >
                {m.sender}
              </span>
              <span className="text-muted-foreground"> · </span>
              <span>{m.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 min-w-0 rounded border border-border bg-card text-foreground px-3 py-2 text-sm"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === ENTER_KEY) send();
          }}
          placeholder={t('PLACEHOLDER')}
          disabled={!canSend}
        />
        <Button onClick={send} disabled={!canSend || !draft.trim()}>
          {t('SEND')}
        </Button>
      </div>
    </div>
  );
}

export function ChatPanel(props: ChatPanelProps) {
  return (
    <ChatRoomI18nProvider>
      <ChatPanelContent {...props} />
    </ChatRoomI18nProvider>
  );
}
