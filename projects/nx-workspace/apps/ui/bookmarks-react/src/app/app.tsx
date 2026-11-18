import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import {
  Bookmark,
  ListChecks,
  Monitor,
  Moon,
  Settings,
  Sun,
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
  moveQuickLinkFocusByDirection,
  SegmentedControl,
  Select,
  ThemeProvider,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useTheme,
  type SegmentedControlOption,
  type ThemePreference,
} from '@vigilant-broccoli/react-lib';
import { SearchableListRow } from '@vigilant-broccoli/react-lib-higher-level';
import { QuickLinksPanel } from '@vigilant-broccoli/react-lib-quick-links';
import { I18nProvider, useTranslation } from './i18n';
import { usePageTitle } from './use-page-title';
import { parseBookmarks, TAB, useBookmarks } from './use-bookmarks';
import { readDroppedLink } from './dropped-link';

const THEME_STORAGE_KEY = 'bookmarks-react-theme';
const EMPTY_FORM = { label: '', target: '', subgroup: '' };
const EXPORT_FILENAME = 'bookmarks.json';
const JSON_TYPE = 'application/json';
const ICON_SIZE = 14;
const CONFIRM = { CLEAR_ALL: 'clear-all', RESET_TO_DEFAULT: 'reset' } as const;
type Confirm = (typeof CONFIRM)[keyof typeof CONFIRM];
const TAB_TITLE_KEYS = {
  [TAB.BOOKMARKS]: 'BOOKMARKS',
  [TAB.MANAGE]: 'MANAGE',
  [TAB.SETTINGS]: 'SETTINGS',
} as const;
const HELP_KEYS = [
  'HELP_DROP',
  'HELP_KEYBOARD',
  'HELP_FAVORITES',
  'HELP_STORAGE',
  'HELP_IMPORT',
] as const;
// Radix Select items cannot have an empty value, so the "none" and "new" choices use sentinels.
const ARROW_DIRECTION = { ArrowDown: 'down', ArrowUp: 'up' } as const;
const NO_SUBGROUP = '__none__';
const NEW_SUBGROUP = '__new__';

function BookmarksPage() {
  const { t } = useTranslation();
  const { bookmarks, tab, setBookmarks, resetBookmarks, setTab, storageError } =
    useBookmarks();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isNewSubgroup, setIsNewSubgroup] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pendingImport, setPendingImport] = useState<QuickLink[] | null>(null);
  const [confirming, setConfirming] = useState<Confirm | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
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
  const needle = search.trim().toLowerCase();
  const matchesSearch = (link: QuickLink) =>
    !needle || `${link.label} ${link.target}`.toLowerCase().includes(needle);
  const sortedSubgroups = (links: QuickLink[]) =>
    [...new Set(links.map(link => link.subgroup ?? ''))].sort((a, b) =>
      a.localeCompare(b),
    );
  const subgroups = sortedSubgroups(bookmarks);
  const visibleSubgroups = sortedSubgroups(bookmarks.filter(matchesSearch));
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
    setTab(TAB.MANAGE);
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
  const moveFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (!(event.key in ARROW_DIRECTION)) return;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    moveQuickLinkFocusByDirection({
      contentRoot: listRef.current,
      searchInput: searchRef.current,
      currentElement: event.currentTarget,
      direction: ARROW_DIRECTION[event.key as keyof typeof ARROW_DIRECTION],
    });
  };
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
  const readImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setPendingImport(null);
    setError('');
    if (!file) return;
    try {
      setPendingImport(parseBookmarks(JSON.parse(await file.text())));
    } catch {
      setError(t('INVALID_IMPORT'));
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
    setPendingImport(null);
  };
  return (
    <main className="min-h-dvh bg-background px-4 pb-4 pt-2 text-foreground sm:px-8 sm:pb-8 sm:pt-4">
      <h1 className="sr-only">{t('TITLE')}</h1>
      {isDragging && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center border-4 border-dashed border-primary bg-background/80 text-lg font-medium"
        >
          {t('DROP_TO_ADD')}
        </div>
      )}
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mx-auto max-w-2xl space-y-6"
      >
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value={TAB.BOOKMARKS}>
              <Bookmark size={ICON_SIZE} />
              {t('BOOKMARKS')}
            </TabsTrigger>
            <TabsTrigger value={TAB.MANAGE}>
              <ListChecks size={ICON_SIZE} />
              {t('MANAGE')}
            </TabsTrigger>
            <TabsTrigger value={TAB.SETTINGS}>
              <Settings size={ICON_SIZE} />
              {t('SETTINGS')}
            </TabsTrigger>
          </TabsList>
          <IconButton
            variant="ghost"
            icon="help"
            aria-label={t('HELP')}
            className="ml-auto"
            onClick={() => setIsHelpOpen(true)}
          />
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
        <TabsContent value={TAB.BOOKMARKS}>
          {bookmarks.length ? (
            <QuickLinksPanel
              links={bookmarks}
              autoFocusSearch
              enableFavorites
            />
          ) : (
            <p className="py-8">{t('EMPTY')}</p>
          )}
        </TabsContent>
        <TabsContent value={TAB.MANAGE} className="space-y-2">
          <div className="flex flex-wrap items-center gap-1">
            <IconButton
              variant="ghost"
              icon="plus"
              aria-label={t('ADD')}
              onClick={openAdd}
            />
            <IconButton
              variant="ghost"
              icon="download"
              aria-label={t('EXPORT')}
              onClick={exportBookmarks}
            />
            <IconButton
              variant="ghost"
              icon="upload"
              aria-label={t('IMPORT')}
              onClick={() => importInput.current?.click()}
            />
            <input
              ref={importInput}
              type="file"
              accept=".json,application/json"
              onChange={readImport}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
            <div className="ml-auto flex items-center gap-2">
              <IconButton
                variant="destructive-ghost"
                icon="trash"
                aria-label={t('CLEAR_ALL')}
                disabled={!bookmarks.length}
                onClick={() => setConfirming(CONFIRM.CLEAR_ALL)}
              />
              <IconButton
                variant="destructive-ghost"
                icon="rotate-ccw"
                aria-label={t('RESET_TO_DEFAULT')}
                onClick={() => setConfirming(CONFIRM.RESET_TO_DEFAULT)}
              />
              <DeleteItemConfirmationDialog
                open={confirming === CONFIRM.CLEAR_ALL}
                onOpenChange={open =>
                  setConfirming(open ? CONFIRM.CLEAR_ALL : null)
                }
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
            </div>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={open =>
              open ? setIsDialogOpen(true) : closeDialog()
            }
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
          {error && !isDialogOpen && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          {pendingImport && (
            <section className="space-y-2">
              <p>{t('IMPORT_READY', { count: pendingImport.length })}</p>
              <div className="flex gap-2">
                <Button onClick={() => importBookmarks(false)}>
                  {t('MERGE')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => importBookmarks(true)}
                >
                  {t('REPLACE')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPendingImport(null)}
                >
                  {t('CANCEL')}
                </Button>
              </div>
            </section>
          )}
          <Input
            ref={searchRef}
            type="search"
            onKeyDown={moveFocus}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t('SEARCH')}
            aria-label={t('SEARCH')}
          />
          <div ref={listRef} className="space-y-2">
            {visibleSubgroups.map(group => (
              <section key={group} className="space-y-2">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group || t('UNGROUPED')}
                </h2>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {bookmarks
                    .map((link, index) => ({ link, index }))
                    .filter(
                      ({ link }) =>
                        matchesSearch(link) && (link.subgroup ?? '') === group,
                    )
                    .map(({ link, index }) => (
                      <SearchableListRow
                        key={index}
                        entry={{ label: link.label, value: link.target }}
                        onActivate={() => openEdit(index)}
                        onKeyDown={moveFocus}
                        actions={
                          <>
                            <IconButton
                              variant="ghost"
                              icon="edit"
                              aria-label={t('EDIT')}
                              onClick={() => openEdit(index)}
                            />
                            <IconButton
                              variant="ghost"
                              icon="trash"
                              aria-label={t('DELETE')}
                              onClick={() => {
                                if (window.confirm(t('CONFIRM_DELETE'))) {
                                  setBookmarks(
                                    bookmarks.filter((_, i) => i !== index),
                                  );
                                }
                              }}
                            />
                          </>
                        }
                      />
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </TabsContent>
        <TabsContent value={TAB.SETTINGS} className="space-y-3">
          <h2 className="text-sm font-medium">{t('APPEARANCE')}</h2>
          <SegmentedControl
            label={t('THEME')}
            value={preference}
            options={themeOptions}
            onChange={setPreference}
            fullWidth
          />
        </TabsContent>
      </Tabs>
    </main>
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
