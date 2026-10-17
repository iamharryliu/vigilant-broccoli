import { DemoMessage } from '../../lib/demo.types';
import { SlackText } from '../../lib/slack-text';
import { useTranslation } from '../i18n';

type Props = {
  appName: string;
  messages: DemoMessage[];
  userName: (userId: string) => string;
  onPreviewReminder: () => void;
};

export const MessagesPage = ({
  appName,
  messages,
  userName,
  onPreviewReminder,
}: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <h2 className="header">{t('MESSAGES.TITLE')}</h2>
      <div className="actions">
        <button className="btn" onClick={onPreviewReminder}>
          {t('MESSAGES.PREVIEW_REMINDER')}
        </button>
      </div>
      {messages.length === 0 && (
        <div className="empty">{t('MESSAGES.EMPTY')}</div>
      )}
      {messages.map(message => (
        <div key={message.id} className="card">
          <div className="meta">
            <b>{appName}</b> · {message.channelLabel}
            {message.ephemeral && (
              <span className="tag">{t('MESSAGES.ONLY_YOU')}</span>
            )}
          </div>
          <SlackText text={message.text} markup userName={userName} />
        </div>
      ))}
    </>
  );
};
