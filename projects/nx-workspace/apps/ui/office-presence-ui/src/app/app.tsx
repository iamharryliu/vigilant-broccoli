import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useDocumentThemeClass,
  useDocumentTitle,
} from '@vigilant-broccoli/react-lib';
import { BlockAction, demoClient } from '../lib/demo-client';
import { getStoredUserId, storeUserId } from '../lib/demo-session';
import { DemoSnapshot } from '../lib/demo.types';
import { BlockView } from './components/BlockView';
import { MessagesPage } from './components/MessagesPage';
import { ModalDialog } from './components/ModalDialog';
import { Sidebar, TAB, Tab } from './components/Sidebar';
import { I18nProvider, useTranslation } from './i18n';

const THEME_STORAGE_KEY = 'office-presence-ui-theme';
const TOAST_MS = 3500;

type Toast = { id: number; message: string; isError: boolean };

const Demo = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DemoSnapshot | null>(null);
  const [userId, setUserId] = useState<string | null>(getStoredUserId());
  const [tab, setTab] = useState<Tab>(TAB.HOME);
  const [seen, setSeen] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Slack elements are uncontrolled; remounting per response mirrors a fresh view.
  const [version, setVersion] = useState(0);
  const toastId = useRef(0);

  useDocumentTitle(
    `${tab === TAB.HOME ? t('PAGE.HOME') : t('PAGE.MESSAGES')} | ${t('PAGE.SITE_NAME')}`,
  );

  const toast = useCallback((message: string, isError = false) => {
    const id = ++toastId.current;
    setToasts(current => [...current, { id, message, isError }]);
    setTimeout(
      () => setToasts(current => current.filter(item => item.id !== id)),
      TOAST_MS,
    );
  }, []);

  const unreadFor = (snapshot: DemoSnapshot | null, user: string | null) =>
    (snapshot?.messages ?? []).filter(
      message => message.id > (seen[user ?? ''] ?? 0),
    ).length;

  const run = useCallback(
    async (request: (user: string | null) => Promise<DemoSnapshot>) => {
      setBusy(true);
      try {
        const next = await request(userId);
        const before = unreadFor(data, userId);
        setData(next);
        setVersion(current => current + 1);
        if (!userId) setUserId(next.users[0].id);
        if (
          tab !== TAB.MESSAGES &&
          next.messages.filter(m => m.id > (seen[userId ?? ''] ?? 0)).length >
            before
        ) {
          toast(t('STATUS.NEW_MESSAGE', { name: next.appName }));
        }
      } catch (error) {
        toast(
          error instanceof TypeError
            ? t('STATUS.UNREACHABLE')
            : (error as Error).message,
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, data, tab, seen],
  );

  useEffect(() => {
    run(async user => {
      try {
        return await demoClient.state(user);
      } catch (error) {
        // A stored id can name a seeded member a later roster dropped.
        if (!user) throw error;
        const next = await demoClient.state(null);
        setUserId(next.users[0].id);
        storeUserId(next.users[0].id);
        return next;
      }
    });
    // Load once; later calls come from user interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab !== TAB.MESSAGES || !data || !userId) return;
    const latest = data.messages.reduce((max, m) => Math.max(max, m.id), 0);
    setSeen(current =>
      current[userId] === latest ? current : { ...current, [userId]: latest },
    );
  }, [tab, data, userId]);

  const userName = useCallback(
    (id: string) => data?.users.find(user => user.id === id)?.realName ?? id,
    [data],
  );

  const fire = useCallback(
    (action: BlockAction) =>
      run(user => demoClient.action(user as string, action)),
    [run],
  );

  const currentUser = useMemo(
    () =>
      data?.users.find(user => user.id === userId) ??
      data?.users.find(user => user.id !== data.botUserId),
    [data, userId],
  );

  if (!data || !currentUser) {
    return (
      <div className="loading">
        {t('STATUS.LOADING')}
        {toasts.map(item => (
          <div key={item.id} className={`toast${item.isError ? ' error' : ''}`}>
            {item.message}
          </div>
        ))}
      </div>
    );
  }

  const topModal = data.modals[data.modals.length - 1];
  const ctx = {
    users: data.users,
    botUserId: data.botUserId,
    userName,
    mode: 'live' as const,
    fire,
    report: () => undefined,
  };

  return (
    <>
      <div className="app">
        <Sidebar
          appName={data.appName}
          users={data.users}
          botUserId={data.botUserId}
          currentUser={currentUser}
          tab={tab}
          unread={tab === TAB.MESSAGES ? 0 : unreadFor(data, currentUser.id)}
          busy={busy}
          onUserChange={id => {
            setUserId(id);
            storeUserId(id);
            run(() => demoClient.state(id));
          }}
          onTabChange={setTab}
          onReset={() => {
            if (!window.confirm(t('SIDEBAR.RESET_CONFIRM'))) return;
            setSeen({});
            run(user => demoClient.reset(user as string)).then(() =>
              toast(t('STATUS.RESET_DONE')),
            );
          }}
        />
        <main className="main">
          <div className="page">
            {tab === TAB.HOME ? (
              <div key={version}>
                {data.home ? (
                  <BlockView blocks={data.home.blocks} ctx={ctx} />
                ) : (
                  <div className="empty">{t('STATUS.LOADING')}</div>
                )}
              </div>
            ) : (
              <MessagesPage
                appName={data.appName}
                messages={data.messages}
                userName={userName}
                onPreviewReminder={() =>
                  run(user => demoClient.previewReminder(user as string))
                }
              />
            )}
          </div>
        </main>
      </div>
      {topModal && (
        <ModalDialog
          key={`${data.modals.length}:${JSON.stringify(topModal)}`}
          view={topModal}
          users={data.users}
          botUserId={data.botUserId}
          userName={userName}
          onAction={fire}
          onClose={() => run(user => demoClient.closeModal(user as string))}
          onSubmit={(callbackId, values) =>
            run(user => demoClient.submit(user as string, callbackId, values))
          }
        />
      )}
      {toasts.map(item => (
        <div key={item.id} className={`toast${item.isError ? ' error' : ''}`}>
          {item.message}
        </div>
      ))}
    </>
  );
};

export const App = () => {
  useDocumentThemeClass(THEME_STORAGE_KEY);

  return (
    <I18nProvider>
      <Demo />
    </I18nProvider>
  );
};

export default App;
