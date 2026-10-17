import { DemoUser } from '../../lib/demo.types';
import { useTranslation } from '../i18n';

export const TAB = { HOME: 'home', MESSAGES: 'messages' } as const;
export type Tab = (typeof TAB)[keyof typeof TAB];

type Props = {
  appName: string;
  users: DemoUser[];
  botUserId: string;
  currentUser: DemoUser;
  tab: Tab;
  unread: number;
  busy: boolean;
  onUserChange: (userId: string) => void;
  onTabChange: (tab: Tab) => void;
  onReset: () => void;
};

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const Sidebar = ({
  appName,
  users,
  botUserId,
  currentUser,
  tab,
  unread,
  busy,
  onUserChange,
  onTabChange,
  onReset,
}: Props) => {
  const { t } = useTranslation();
  return (
    <aside className="side">
      <h1>{appName}</h1>
      <div>
        <label htmlFor="userSelect">{t('SIDEBAR.VIEWING_AS')}</label>
        <select
          id="userSelect"
          value={currentUser.id}
          onChange={event => onUserChange(event.target.value)}
        >
          {users
            .filter(user => user.id !== botUserId)
            .map(user => (
              <option key={user.id} value={user.id}>
                {user.realName}
                {user.homeOffice ? ` (${user.homeOffice})` : ''}
              </option>
            ))}
        </select>
        <div className="who">
          <span
            className="avatar"
            style={{ background: currentUser.color ?? '#4a154b' }}
          >
            {initials(currentUser.realName)}
          </span>
          <div>
            <b>{currentUser.realName}</b>
            <small>{currentUser.title}</small>
          </div>
        </div>
      </div>
      <nav className="nav">
        <button
          className={tab === TAB.HOME ? 'active' : ''}
          onClick={() => onTabChange(TAB.HOME)}
        >
          {t('SIDEBAR.HOME')}
        </button>
        <button
          className={tab === TAB.MESSAGES ? 'active' : ''}
          onClick={() => onTabChange(TAB.MESSAGES)}
        >
          {t('SIDEBAR.MESSAGES')}
          {unread > 0 && <span className="badge">{unread}</span>}
        </button>
      </nav>
      <div className="spacer" />
      <div className="note">{t('SIDEBAR.NOTE')}</div>
      <button className="reset" disabled={busy} onClick={onReset}>
        {t('SIDEBAR.RESET')}
      </button>
    </aside>
  );
};
