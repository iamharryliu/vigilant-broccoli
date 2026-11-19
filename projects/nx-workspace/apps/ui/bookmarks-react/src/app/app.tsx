import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type MouseEvent,
} from 'react';
import {
  Bookmark,
  CircleHelp,
  Database,
  Download,
  Menu,
  Plus,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  Button,
  DeleteItemConfirmationDialog,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  Textarea,
  ThemePreferenceControl,
  ThemeProvider,
  type EllipsisAction,
} from '@vigilant-broccoli/react-lib';
import { Sidebar, type SidebarCTA } from '@vigilant-broccoli/sidebar';
import { QuickLinksPanel } from '@vigilant-broccoli/react-lib-quick-links';
import { I18nProvider, useTranslation } from './i18n';
import { usePageTitle } from './use-page-title';
import {
  fetchDefaultBookmarks,
  parseBookmarks,
  useBookmarks,
} from './use-bookmarks';
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
} as const;
type Confirm = (typeof CONFIRM)[keyof typeof CONFIRM];
const IMPORT_STEP = { EDIT: 'edit', CHOOSE: 'choose' } as const;
type ImportStep = (typeof IMPORT_STEP)[keyof typeof IMPORT_STEP];
const isSameBookmark = (a: QuickLink, b: QuickLink) =>
  a.label === b.label && a.target === b.target && a.subgroup === b.subgroup;
const mergeBookmarks = (current: QuickLink[], incoming: QuickLink[]) =>
  incoming.reduce(
    (merged, link) =>
      merged.some(old => isSameBookmark(old, link))
        ? merged
        : [...merged, link],
    current,
  );
const getHostname = (target: string) => {
  try {
    return new URL(target).hostname;
  } catch {
    return '';
  }
};
const TAB_TITLE_KEYS = {
  [TAB.BOOKMARKS]: 'BOOKMARKS',
  [TAB.MANAGE]: 'MANAGE',
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
  const { bookmarks, setBookmarks, storageError, isLoadingDefaults } =
    useBookmarks();
  const [defaultsError, setDefaultsError] = useState(false);
  const { tab, setTab } = useRouteTab();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isNewSubgroup, setIsNewSubgroup] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [importText, setImportText] = useState('');
  const [importStep, setImportStep] = useState<ImportStep>(IMPORT_STEP.EDIT);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState<Confirm | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const parsedImport = useMemo(() => {
    if (!importText.trim()) return { links: null, isInvalid: false };
    try {
      return {
        links: parseBookmarks(JSON.parse(importText)),
        isInvalid: false,
      };
    } catch {
      return { links: null, isInvalid: true };
    }
  }, [importText]);
  const pendingImport = parsedImport.links;
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
      label: t('MANAGE'),
      icon: Database,
      href: TAB_PATH[TAB.MANAGE],
      isActive: tab === TAB.MANAGE,
      onClick: event => selectTab(event, TAB.MANAGE),
    },
    {
      label: t('SETTINGS'),
      icon: Settings,
      href: TAB_PATH[TAB.SETTINGS],
      isActive: tab === TAB.SETTINGS,
      onClick: event => selectTab(event, TAB.SETTINGS),
    },
    { label: t('HELP'), icon: CircleHelp, onClick: () => setIsHelpOpen(true) },
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
  const addUrls = form.target
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  const isMultiAdd = addUrls.length > 1;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editing === null) {
      try {
        const links = parseBookmarks(
          addUrls.map(target => ({
            ...form,
            label: form.label.trim() || (isMultiAdd ? getHostname(target) : ''),
            target,
            type: OPEN_TYPE.BROWSER,
          })),
        );
        if (!links.length) throw new Error('No URLs');
        setBookmarks(mergeBookmarks(bookmarks, links));
        closeDialog();
      } catch {
        setError(t(isMultiAdd ? 'INVALID_LINE' : 'INVALID'));
      }
      return;
    }
    try {
      const [link] = parseBookmarks([{ ...form, type: OPEN_TYPE.BROWSER }]);
      setBookmarks(
        bookmarks.map((old, index) => (index === editing ? link : old)),
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
    setImportStep(IMPORT_STEP.EDIT);
    setImportText('');
    setDefaultsError(false);
  };
  const readImportFile = async (file?: File) => {
    if (file) setImportText(await file.text());
  };
  const readImport = async (event: ChangeEvent<HTMLInputElement>) => {
    await readImportFile(event.target.files?.[0]);
    event.target.value = '';
  };
  const loadDefaultJson = async () => {
    try {
      setImportText(JSON.stringify(await fetchDefaultBookmarks(), null, 2));
      setDefaultsError(false);
    } catch {
      setDefaultsError(true);
    }
  };
  const dropImport = (event: ReactDragEvent<HTMLElement>) => {
    event.preventDefault();
    readImportFile(event.dataTransfer.files[0]);
  };
  const mergedImport = mergeBookmarks(bookmarks, pendingImport ?? []);
  const importBookmarks = (replace: boolean) => {
    if (!pendingImport) return;
    setBookmarks(replace ? pendingImport : mergedImport);
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
          <div className="flex items-center justify-between gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('MENU')}
              onClick={() => setIsSidebarOpen(open => !open)}
            >
              <Menu size={ICON_SIZE} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('ADD')}
              onClick={openAdd}
            >
              <Plus size={ICON_SIZE} />
            </Button>
          </div>
          <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <DialogContent scrollable aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>{t('HELP')}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <ul className="list-disc space-y-4 pl-5 text-sm">
                  {HELP_KEYS.map(key => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
              </DialogBody>
            </DialogContent>
          </Dialog>
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
              !isLoadingDefaults && <p className="py-8">{t('EMPTY')}</p>
            )
          ) : tab === TAB.MANAGE ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button onClick={openAdd}>
                  <Plus size={ICON_SIZE} />
                  {t('ADD')}
                </Button>
                <Button
                  variant="destructive"
                  disabled={!bookmarks.length}
                  onClick={() => setConfirming(CONFIRM.CLEAR_ALL)}
                >
                  <Trash2 size={ICON_SIZE} />
                  {t('CLEAR_ALL')}
                </Button>
              </div>
              <hr className="border-border" />
              <h2 className="text-sm font-medium">
                {t('EXPORT_IMPORT_HEADING')}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportBookmarks}>
                  <Download size={ICON_SIZE} />
                  {t('EXPORT')}
                </Button>
                <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                  <Upload size={ICON_SIZE} />
                  {t('IMPORT')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-medium">{t('APPEARANCE')}</h2>
              <ThemePreferenceControl
                label={t('THEME')}
                labels={{
                  system: t('THEME_SYSTEM'),
                  light: t('THEME_LIGHT'),
                  dark: t('THEME_DARK'),
                }}
                fullWidth
              />
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
        <Dialog
          open={isDialogOpen}
          onOpenChange={open => (open ? setIsDialogOpen(true) : closeDialog())}
        >
          <DialogContent
            fullScreenOnMobile
            scrollable
            aria-describedby={undefined}
          >
            <form
              onSubmit={submit}
              className="flex min-h-0 flex-1 flex-col gap-4"
            >
              <DialogHeader>
                <DialogTitle>
                  {t(editing === null ? 'ADD' : 'EDIT')}
                </DialogTitle>
              </DialogHeader>
              <DialogBody className="space-y-3">
                <label className="block">
                  {t('LABEL')}
                  <Input
                    required={editing !== null || !isMultiAdd}
                    value={form.label}
                    onChange={e => setForm({ ...form, label: e.target.value })}
                  />
                </label>
                {editing === null ? (
                  <label className="block">
                    {t('URLS')}
                    <Textarea
                      required
                      value={form.target}
                      onChange={e =>
                        setForm({ ...form, target: e.target.value })
                      }
                      placeholder={t('URLS_PLACEHOLDER')}
                      spellCheck={false}
                      className="min-h-24"
                    />
                    <span className="block text-xs text-muted-foreground">
                      {t('URLS_HINT')}
                    </span>
                  </label>
                ) : (
                  <label className="block">
                    {t('URL')}
                    <Input
                      required
                      type="url"
                      value={form.target}
                      onChange={e =>
                        setForm({ ...form, target: e.target.value })
                      }
                    />
                  </label>
                )}
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
              </DialogBody>
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
          <DialogContent
            fullScreenOnMobile
            scrollable
            aria-describedby={undefined}
          >
            <DialogHeader>
              <DialogTitle>{t('IMPORT')}</DialogTitle>
            </DialogHeader>
            {importStep === IMPORT_STEP.EDIT ? (
              <>
                <DialogBody
                  className="space-y-3 text-sm"
                  onDragOver={event => event.preventDefault()}
                  onDrop={dropImport}
                >
                  <p>{t('IMPORT_SHAPE')}</p>
                  <Textarea
                    value={importText}
                    onChange={event => setImportText(event.target.value)}
                    placeholder={`${t('IMPORT_HINT')}\n${IMPORT_EXAMPLE}`}
                    spellCheck={false}
                    aria-label={t('IMPORT_TEXT')}
                    className="min-h-48 font-mono text-xs sm:min-h-80"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadDefaultJson}
                    >
                      {t('SET_TO_DEFAULT_JSON')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => importFileRef.current?.click()}
                    >
                      {t('IMPORT_FILE')}
                    </Button>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={readImport}
                    />
                  </div>
                  {defaultsError && (
                    <p role="alert" className="text-destructive">
                      {t('DEFAULTS_UNAVAILABLE')}
                    </p>
                  )}
                  {parsedImport.isInvalid && (
                    <p role="alert" className="text-destructive">
                      {t('INVALID_IMPORT')}
                    </p>
                  )}
                  {pendingImport && (
                    <p role="status">
                      {t('IMPORT_READY', { count: pendingImport.length })}
                    </p>
                  )}
                </DialogBody>
                <DialogFooter>
                  <Button
                    disabled={!pendingImport}
                    onClick={() => setImportStep(IMPORT_STEP.CHOOSE)}
                  >
                    {t('SUBMIT')}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogBody className="space-y-3 text-sm">
                  <p>
                    {t('IMPORT_CHOOSE', { count: pendingImport?.length ?? 0 })}
                  </p>
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-start gap-1 whitespace-normal py-3 text-left"
                    onClick={() => importBookmarks(false)}
                  >
                    <span className="font-medium">{t('MERGE')}</span>
                    <span className="font-normal text-muted-foreground">
                      {t('MERGE_INFO', {
                        added: mergedImport.length - bookmarks.length,
                        current: bookmarks.length,
                      })}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-start gap-1 whitespace-normal py-3 text-left"
                    onClick={() => importBookmarks(true)}
                  >
                    <span className="font-medium text-destructive">
                      {t('REPLACE')}
                    </span>
                    <span className="font-normal text-muted-foreground">
                      {t('REPLACE_INFO', {
                        current: bookmarks.length,
                        count: pendingImport?.length ?? 0,
                      })}
                    </span>
                  </Button>
                </DialogBody>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setImportStep(IMPORT_STEP.EDIT)}
                  >
                    {t('BACK')}
                  </Button>
                </DialogFooter>
              </>
            )}
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
