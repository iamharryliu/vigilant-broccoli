import { useState, type FormEvent, type ChangeEvent } from 'react';
import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  IconButton,
  Input,
  Select,
  ThemeProvider,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
import {
  QuickLinksPanel,
  SearchableListRow,
} from '@vigilant-broccoli/react-lib-higher-level';
import { I18nProvider, useTranslation } from './i18n';
import { usePageTitle } from './use-page-title';
import { parseBookmarks, TAB, useBookmarks } from './use-bookmarks';

const THEME_STORAGE_KEY = 'bookmarks-react-theme';
const EMPTY_FORM = { label: '', target: '', subgroup: '' };
const EXPORT_FILENAME = 'bookmarks.json';
const JSON_TYPE = 'application/json';
// Radix Select items cannot have an empty value, so the "none" and "new" choices use sentinels.
const NO_SUBGROUP = '__none__';
const NEW_SUBGROUP = '__new__';

function BookmarksPage() {
  const { t } = useTranslation();
  const { bookmarks, tab, setBookmarks, setTab, storageError } = useBookmarks();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isNewSubgroup, setIsNewSubgroup] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pendingImport, setPendingImport] = useState<QuickLink[] | null>(null);
  usePageTitle(t(tab === TAB.MANAGE ? 'MANAGE' : 'BOOKMARKS'));
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
    <main className="min-h-dvh bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">{t('TITLE')}</h1>
          <p className="text-muted-foreground">{t('INTRO')}</p>
        </header>
        {storageError && <p role="status">{t('STORAGE_ERROR')}</p>}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value={TAB.BOOKMARKS}>{t('BOOKMARKS')}</TabsTrigger>
            <TabsTrigger value={TAB.MANAGE}>{t('MANAGE')}</TabsTrigger>
          </TabsList>
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
          <TabsContent value={TAB.MANAGE} className="space-y-6">
            <Button onClick={openAdd}>{t('ADD')}</Button>
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
                      onChange={e =>
                        setForm({ ...form, label: e.target.value })
                      }
                    />
                  </label>
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                    >
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
            <section className="space-y-3">
              <Button variant="outline" onClick={exportBookmarks}>
                {t('EXPORT')}
              </Button>
              <label className="block">
                {t('IMPORT')}
                <Input
                  type="file"
                  accept=".json,application/json"
                  onChange={readImport}
                />
              </label>
              <Button
                variant="destructive"
                disabled={!bookmarks.length}
                onClick={() => {
                  if (window.confirm(t('CONFIRM_CLEAR_ALL'))) {
                    setBookmarks([]);
                  }
                }}
              >
                {t('CLEAR_ALL')}
              </Button>
              {pendingImport && (
                <div className="space-y-2">
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
                </div>
              )}
            </section>
            {subgroups.map(group => (
              <section key={group} className="space-y-2">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group || t('UNGROUPED')}
                </h2>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {bookmarks
                    .map((link, index) => ({ link, index }))
                    .filter(({ link }) => (link.subgroup ?? '') === group)
                    .map(({ link, index }) => (
                      <SearchableListRow
                        key={index}
                        entry={{ label: link.label, value: link.target }}
                        onActivate={() => openEdit(index)}
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
          </TabsContent>
        </Tabs>
      </div>
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
