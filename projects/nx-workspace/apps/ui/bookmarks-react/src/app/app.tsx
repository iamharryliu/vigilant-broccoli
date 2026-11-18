import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
  type MouseEvent,
} from 'react';
import {
  Bookmark,
  Download,
  Menu,
  RotateCcw,
  Monitor,
  Moon,
  Settings,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  Button,
  DeleteItemConfirmationDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  IconButton,
  Input,
  SegmentedControl,
  Select,
  ThemeProvider,
  useTheme,
  type EllipsisAction,
  type SegmentedControlOption,
  type ThemePreference,
} from '@vigilant-broccoli/react-lib';
import {
  Sidebar,
  type SidebarCTA,
} from '@vigilant-broccoli/react-lib-higher-level';
import { QuickLinksPanel } from '@vigilant-broccoli/react-lib-quick-links';
import { I18nProvider, useTranslation } from './i18n';
import { usePageTitle } from './use-page-title';
import { parseBookmarks, useBookmarks } from './use-bookmarks';
import { TAB, TAB_PATH, useRouteTab, type Tab } from './use-route-tab';
import { readDroppedLink } from './dropped-link';

const THEME_STORAGE_KEY = 'bookmarks-react-theme';
const EMPTY_FORM = { label: '', target: '', subgroup: '' };
const EXPORT_FILENAME = 'bookmarks.json';
const JSON_TYPE = 'application/json';
const ICON_SIZE = 14;
const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';
const CONFIRM = {
  CLEAR_ALL: 'clear-all',
  RESET_TO_DEFAULT: 'reset',
} as const;
type Confirm = (typeof CONFIRM)[keyof typeof CONFIRM];
const TAB_TITLE_KEYS = {
  [TAB.BOOKMARKS]: 'BOOKMARKS',
  [TAB.SETTINGS]: 'SETTINGS',
} as const;
const HELP_KEYS = [
  'HELP_DROP',
  'HELP_KEYBOARD',
  'HELP_EDIT',
  'HELP_NAVIGATION',
  'HELP_FAVORITES',
  'HELP_STORAGE',
  'HELP_IMPORT',
] as const;
const IMPORT_EXAMPLE = JSON.stringify(
  [
    {
      label: 'Example',
      target: 'https://example.com',
      type: 'browser',
      subgroup: 'Optional group',
    },
  ],
  null,
  2,
);
// Radix Select items cannot have an empty value, so the "none" and "new" choices use sentinels.
const NO_SUBGROUP = '__none__';
const NEW_SUBGROUP = '__new__';

function BookmarksPage() {
  const { t } = useTranslation();
  const { bookmarks, setBookmarks, resetBookmarks, storageError } =
    useBookmarks();
  const { tab, setTab } = useRouteTab();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isNewSubgroup, setIsNewSubgroup] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pendingImport, setPendingImport] = useState<QuickLink[] | null>(null);
  const [confirming, setConfirming] = useState<Confirm | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const { preference, setPreference } = useTheme();
  const themeOptions: SegmentedControlOption<ThemePreference>[] = [
    {
      value: 'system',
      label: t('THEME_SYSTEM'),
      icon: <Monitor size={ICON_SIZE} />,
    },
    {
      value: 'light',
      label: t('THEME_LIGHT'),
      icon: <Sun size={ICON_SIZE} />,
    },
    {
      value: 'dark',
      label: t('THEME_DARK'),
      icon: <Moon size={ICON_SIZE} />,
    },
  ];
  usePageTitle(t(TAB_TITLE_KEYS[tab]));
  const sidebarItems: SidebarCTA[] = [
    {
      label: t('BOOKMARKS'),
      icon: Bookmark,
      href: TAB_PATH[TAB.BOOKMARKS],
      isActive: tab === TAB.BOOKMARKS,
      onClick: event => selectTab(event, TAB.BOOKMARKS),
    },
    {
      label: t('SETTINGS'),
      icon: Settings,
      href: TAB_PATH[TAB.SETTINGS],
      isActive: tab === TAB.SETTINGS,
      onClick: event => selectTab(event, TAB.SETTINGS),
    },
  ];
  const subgroups = [
    ...new Set(bookmarks.map(link => link.subgroup ?? '')),
  ].sort((a, b) => a.localeCompare(b));
  const subgroupOptions = [
    NO_SUBGROUP,
    ...subgroups.filter(Boolean),
    NEW_SUBGROUP,
  ];
  const subgroupDisplay = {
    [NO_SUBGROUP]: t('NO_SUBGROUP'),
    [NEW_SUBGROUP]: t('NEW_SUBGROUP'),
  };
  const selectedSubgroup = isNewSubgroup
    ? NEW_SUBGROUP
    : form.subgroup || NO_SUBGROUP;
  const changeSubgroup = (value: string) => {
    setIsNewSubgroup(value === NEW_SUBGROUP);
    setForm({
      ...form,
      subgroup: value === NEW_SUBGROUP || value === NO_SUBGROUP ? '' : value,
    });
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setForm(EMPTY_FORM);
    setIsNewSubgroup(false);
    setEditing(null);
    setError('');
  };
  const openAdd = () => {
    closeDialog();
    setIsDialogOpen(true);
  };
  const openEdit = (index: number) => {
    const link = bookmarks[index];
    setEditing(index);
    setForm({
      label: link.label,
      target: link.target,
      subgroup: link.subgroup ?? '',
    });
    setIsNewSubgroup(false);
    setError('');
    setIsDialogOpen(true);
  };
  const openDropped = (link: { label: string; target: string }) => {
    setTab(TAB.BOOKMARKS);
    setEditing(null);
    setForm({ ...EMPTY_FORM, ...link });
    setIsNewSubgroup(false);
    setError('');
    setIsDialogOpen(true);
  };
  const onDropLink = useRef(openDropped);
  onDropLink.current = openDropped;
  useEffect(() => {
    let depth = 0;
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      target.closest('input, textarea, [contenteditable]') !== null;
    const hasLink = (event: DragEvent) =>
      !isEditable(event.target) &&
      !!event.dataTransfer &&
      (event.dataTransfer.types.includes('text/uri-list') ||
        event.dataTransfer.types.includes('text/plain'));
    const onEnter = (event: DragEvent) => {
      if (!hasLink(event)) return;
      depth += 1;
      setIsDragging(true);
    };
    const onOver = (event: DragEvent) => {
      if (hasLink(event)) event.preventDefault();
    };
    const onLeave = (event: DragEvent) => {
      if (!hasLink(event)) return;
      depth = Math.max(0, depth - 1);
      if (!depth) setIsDragging(false);
    };
    const onDrop = (event: DragEvent) => {
      depth = 0;
      setIsDragging(false);
      if (!hasLink(event) || !event.dataTransfer) return;
      event.preventDefault();
      const link = readDroppedLink(event.dataTransfer);
      if (link) onDropLink.current(link);
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);
  // Modified clicks keep their native new-tab behavior on the sidebar's real links.
  const selectTab = (event: MouseEvent<HTMLElement>, next: Tab) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button)
      return;
    event.preventDefault();
    setTab(next);
  };
  const getMenuActions = (link: QuickLink): EllipsisAction[] => [
    { label: t('EDIT'), onSelect: () => openEdit(bookmarks.indexOf(link)) },
    {
      label: t('DELETE'),
      color: 'red',
      onSelect: () => setBookmarks(bookmarks.filter(old => old !== link)),
      confirm: {
        title: t('DELETE'),
        description: t('CONFIRM_DELETE'),
        confirmLabel: t('DELETE'),
      },
    },
  ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    try {
      const [link] = parseBookmarks([{ ...form, type: OPEN_TYPE.BROWSER }]);
      setBookmarks(
        editing === null
          ? [...bookmarks, link]
          : bookmarks.map((old, index) => (index === editing ? link : old)),
      );
      closeDialog();
    } catch {
      setError(t('INVALID'));
    }
  };
  const exportBookmarks = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(bookmarks, null, 2)], { type: JSON_TYPE }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = EXPORT_FILENAME;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const closeImport = () => {
    setIsImportOpen(false);
    setPendingImport(null);
    setImportError('');
  };
  const readImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPendingImport(null);
    setImportError('');
    if (!file) return;
    try {
      setPendingImport(parseBookmarks(JSON.parse(await file.text())));
    } catch {
      setImportError(t('INVALID_IMPORT'));
    }
  };
  const importBookmarks = (replace: boolean) => {
    if (!pendingImport) return;
    const merged = replace ? [] : [...bookmarks];
    for (const link of pendingImport) {
      if (
        !merged.some(
          old =>
            old.label === link.label &&
            old.target === link.target &&
            old.subgroup === link.subgroup,
        )
      )
        merged.push(link);
    }
    setBookmarks(replace ? pendingImport : merged);
    closeImport();
  };
  return (
    <>
      <Sidebar
        items={sidebarItems}
        className={SIDEBAR_POSITION}
        mobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />
      <main className="min-h-dvh bg-background px-4 pb-4 pt-2 text-foreground transition-[padding] duration-200 sm:px-8 sm:pb-8 sm:pt-4 md:pl-[5.5rem] md:peer-hover:pl-56">
        <h1 className="sr-only">{t('TITLE')}</h1>
        {isDragging && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center border-4 border-dashed border-primary bg-background/80 text-lg font-medium"
          >
            {t('DROP_TO_ADD')}
          </div>
        )}
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={t('MENU')}
              onClick={() => setIsSidebarOpen(open => !open)}
            >
              <Menu size={ICON_SIZE} />
            </Button>
            <div className="ml-auto flex items-center gap-1">
              <IconButton
                variant="ghost"
                icon="plus"
                aria-label={t('ADD')}
                onClick={openAdd}
              />
              <IconButton
                variant="ghost"
                icon="help"
                aria-label={t('HELP')}
                onClick={() => setIsHelpOpen(true)}
              />
            </div>
            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>{t('HELP')}</DialogTitle>
                </DialogHeader>
                <ul className="list-disc space-y-4 pl-5 text-sm">
                  {HELP_KEYS.map(key => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
              </DialogContent>
            </Dialog>
          </div>
          {storageError && <p role="status">{t('STORAGE_ERROR')}</p>}
          {tab === TAB.BOOKMARKS ? (
            bookmarks.length ? (
              <QuickLinksPanel
                links={bookmarks}
                autoFocusSearch
                enableFavorites
                getMenuActions={getMenuActions}
              />
            ) : (
              <p className="py-8">{t('EMPTY')}</p>
            )
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-medium">{t('APPEARANCE')}</h2>
              <SegmentedControl
                label={t('THEME')}
                value={preference}
                options={themeOptions}
                onChange={setPreference}
                fullWidth
              />
              <h2 className="pt-3 text-sm font-medium">{t('DATA')}</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportBookmarks}>
                  <Download size={ICON_SIZE} />
                  {t('EXPORT')}
                </Button>
                <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                  <Upload size={ICON_SIZE} />
                  {t('IMPORT')}
                </Button>
                <Button
                  variant="destructive"
                  disabled={!bookmarks.length}
                  onClick={() => setConfirming(CONFIRM.CLEAR_ALL)}
                >
                  <Trash2 size={ICON_SIZE} />
                  {t('CLEAR_ALL')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirming(CONFIRM.RESET_TO_DEFAULT)}
                >
                  <RotateCcw size={ICON_SIZE} />
                  {t('RESET_TO_DEFAULT')}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DeleteItemConfirmationDialog
          open={confirming === CONFIRM.CLEAR_ALL}
          onOpenChange={open => setConfirming(open ? CONFIRM.CLEAR_ALL : null)}
          title={t('CLEAR_ALL')}
          description={t('CONFIRM_CLEAR_ALL')}
          confirmLabel={t('CLEAR_ALL')}
          cancelLabel={t('CANCEL')}
          deleteItem={async () => setBookmarks([])}
        />
        <DeleteItemConfirmationDialog
          open={confirming === CONFIRM.RESET_TO_DEFAULT}
          onOpenChange={open =>
            setConfirming(open ? CONFIRM.RESET_TO_DEFAULT : null)
          }
          title={t('RESET_TO_DEFAULT')}
          description={t('CONFIRM_RESET_TO_DEFAULT')}
          confirmLabel={t('RESET_TO_DEFAULT')}
          cancelLabel={t('CANCEL')}
          deleteItem={async () => resetBookmarks()}
        />
        <Dialog
          open={isDialogOpen}
          onOpenChange={open => (open ? setIsDialogOpen(true) : closeDialog())}
        >
          <DialogContent fullScreenOnMobile aria-describedby={undefined}>
            <form onSubmit={submit} className="space-y-3">
              <DialogHeader>
                <DialogTitle>
                  {t(editing === null ? 'ADD' : 'EDIT')}
                </DialogTitle>
              </DialogHeader>
              <label className="block">
                {t('LABEL')}
                <Input
                  required
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                />
              </label>
              <label className="block">
                {t('URL')}
                <Input
                  required
                  type="url"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
                />
              </label>
              <div className="space-y-1">
                <span className="block">{t('SUBGROUP')}</span>
                <Select
                  value={selectedSubgroup}
                  onValueChange={changeSubgroup}
                  options={subgroupOptions}
                  displayMapper={subgroupDisplay}
                  aria-label={t('SUBGROUP')}
                  className="w-full"
                />
              </div>
              {isNewSubgroup && (
                <label className="block">
                  {t('NEW_SUBGROUP_NAME')}
                  <Input
                    value={form.subgroup}
                    onChange={e =>
                      setForm({ ...form, subgroup: e.target.value })
                    }
                  />
                </label>
              )}
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  {t('CANCEL')}
                </Button>
                <Button type="submit">
                  {t(editing === null ? 'ADD' : 'SAVE')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isImportOpen}
          onOpenChange={open => (open ? setIsImportOpen(true) : closeImport())}
        >
          <DialogContent fullScreenOnMobile aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{t('IMPORT')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p>{t('IMPORT_SHAPE')}</p>
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-xs">
                {IMPORT_EXAMPLE}
              </pre>
              <p className="text-muted-foreground">{t('IMPORT_RULES')}</p>
              <label className="block space-y-1">
                <span className="block">{t('IMPORT_FILE')}</span>
                <Input
                  type="file"
                  accept=".json,application/json"
                  onChange={readImport}
                />
              </label>
              {importError && (
                <p role="alert" className="text-destructive">
                  {importError}
                </p>
              )}
              {pendingImport && (
                <p role="status">
                  {t('IMPORT_READY', { count: pendingImport.length })}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeImport}>
                {t('CANCEL')}
              </Button>
              <Button
                disabled={!pendingImport}
                onClick={() => importBookmarks(false)}
              >
                {t('MERGE')}
              </Button>
              <Button
                variant="destructive"
                disabled={!pendingImport}
                onClick={() => importBookmarks(true)}
              >
                {t('REPLACE')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>
        <BookmarksPage />
      </ThemeProvider>
    </I18nProvider>
  );
}
export default App;
