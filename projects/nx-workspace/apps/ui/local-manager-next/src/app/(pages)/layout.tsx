'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SIDEBAR_ROUTE } from '../app.const';
import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../libs/auth';
import { FloatingIslandComponent } from '../components/floating-island.component';
import { RightSidebar } from '../components/right-sidebar.component';
import { ShortcutsOverlay } from '../components/shortcuts-overlay.component';
import { useDeployNotifications } from '../hooks/useDeployNotifications';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useBrowserNotifications } from '../hooks/useBrowserNotifications';
import { useBackgroundTaskNotifications } from '../hooks/useBackgroundTaskNotifications';
import { useUnreadDocumentTitle } from '../hooks/useUnreadDocumentTitle';
import { NotificationContext } from '../context/NotificationContext';

const IGNORED_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
const SHORTCUTS_OVERLAY_KEY_CODE = 'Slash';

const isIgnoredInputElement = (target: EventTarget | null): boolean => {
  return target instanceof Element && IGNORED_TAGS.includes(target.tagName);
};

const shouldIgnoreKeystroke = (e: KeyboardEvent): boolean => {
  return isIgnoredInputElement(e.target) || e.ctrlKey || e.metaKey || e.altKey;
};

type KeyboardHandlers = {
  setSearchDialogOpen: (open: boolean) => void;
  setEmailDialogOpen: (open: boolean) => void;
  openChatbot: () => void;
  setCalendarDialogOpen: (open: boolean) => void;
  setNotepadDialogOpen: (open: boolean) => void;
  setUtilitiesDialogOpen: (open: boolean) => void;
};

const processKeyboardInput = (
  key: string,
  isShift: boolean,
  handlers: KeyboardHandlers,
): boolean => {
  switch (key) {
    case '/':
      handlers.setSearchDialogOpen(true);
      return true;
    case 'm':
      handlers.setEmailDialogOpen(true);
      return true;
    case 'c':
      if (!isShift) {
        handlers.openChatbot();
        return true;
      }
      if (isShift) {
        handlers.setCalendarDialogOpen(true);
        return true;
      }
      return false;
    case 'n':
      handlers.setNotepadDialogOpen(true);
      return true;
    case 'u':
      handlers.setUtilitiesDialogOpen(true);
      return true;
    default:
      return false;
  }
};

const handleKeyboardShortcut = (
  e: KeyboardEvent,
  handlers: KeyboardHandlers,
): void => {
  if (shouldIgnoreKeystroke(e)) {
    return;
  }

  if (processKeyboardInput(e.key.toLowerCase(), e.shiftKey, handlers)) {
    e.preventDefault();
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isStatusPage = usePathname() === SIDEBAR_ROUTE.STATUS.path;
  const _session = useAuth();
  const { notifications, unreadCount, add, markAllRead, clear } =
    useNotificationHistory();
  const { notify: browserNotify } = useBrowserNotifications();
  const handleNotification = useCallback(
    (payload: Parameters<typeof browserNotify>[0]) => {
      add(payload);
      browserNotify(payload);
    },
    [add, browserNotify],
  );
  useDeployNotifications(handleNotification);
  useBackgroundTaskNotifications();
  useUnreadDocumentTitle(unreadCount);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const handleSetNotificationsOpen = useCallback(
    (open: boolean) => {
      setNotificationsOpen(open);
      if (open) markAllRead();
    },
    [markAllRead],
  );
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [notepadDialogOpen, setNotepadDialogOpen] = useState(false);
  const [utilitiesDialogOpen, setUtilitiesDialogOpen] = useState(false);
  const [shortcutsOverlayOpen, setShortcutsOverlayOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === SHORTCUTS_OVERLAY_KEY_CODE &&
        e.shiftKey &&
        !shouldIgnoreKeystroke(e)
      ) {
        e.preventDefault();
        setShortcutsOverlayOpen(true);
        return;
      }

      handleKeyboardShortcut(e, {
        setSearchDialogOpen,
        setEmailDialogOpen,
        openChatbot: () => router.push(SIDEBAR_ROUTE.CHATBOT.path),
        setCalendarDialogOpen,
        setNotepadDialogOpen,
        setUtilitiesDialogOpen,
      });
    };

    // Keyed off e.code (physical key) rather than e.key so the overlay
    // still closes correctly no matter which key - Shift or / - is
    // released first, since e.key would otherwise flip between "?" and
    // "/" depending on Shift's state at release time.
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === SHORTCUTS_OVERLAY_KEY_CODE) {
        setShortcutsOverlayOpen(false);
      }
    };

    // Closes the overlay if focus leaves the window mid-hold (e.g. alt-tab),
    // since no keyup fires in that case.
    const handleBlur = () => setShortcutsOverlayOpen(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [router]);

  return (
    <NotificationContext.Provider value={add}>
      <div className="w-full h-screen flex flex-col overflow-hidden print:h-auto print:overflow-visible print:block">
        <div className="flex flex-1 overflow-hidden print:h-auto print:overflow-visible print:block">
          <main
            className={`flex-1 min-w-0 min-h-0 ${isStatusPage ? 'flex overflow-hidden' : 'p-4 overflow-y-auto'} print:h-auto print:overflow-visible print:p-0 print:w-full`}
          >
            {children}
          </main>
          <div className="print:hidden">
            <RightSidebar
              setSearchDialogOpen={setSearchDialogOpen}
              notificationsOpen={notificationsOpen}
              setNotificationsOpen={handleSetNotificationsOpen}
              unreadCount={unreadCount}
              notifications={notifications}
              onClearNotifications={clear}
            />
          </div>
        </div>
        <ShortcutsOverlay open={shortcutsOverlayOpen} />
        <div style={{ display: 'none' }} aria-hidden="true">
          <FloatingIslandComponent
            searchDialogOpen={searchDialogOpen}
            setSearchDialogOpen={setSearchDialogOpen}
            emailDialogOpen={emailDialogOpen}
            setEmailDialogOpen={setEmailDialogOpen}
            calendarDialogOpen={calendarDialogOpen}
            setCalendarDialogOpen={setCalendarDialogOpen}
            notepadDialogOpen={notepadDialogOpen}
            setNotepadDialogOpen={setNotepadDialogOpen}
            utilitiesDialogOpen={utilitiesDialogOpen}
            setUtilitiesDialogOpen={setUtilitiesDialogOpen}
          />
        </div>
      </div>
    </NotificationContext.Provider>
  );
}
