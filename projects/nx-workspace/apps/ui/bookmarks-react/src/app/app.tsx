import { useState, type FormEvent, type ChangeEvent } from 'react';
import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import {
  Button,
  Input,
  ThemeProvider,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
import { QuickLinksPanel } from '@vigilant-broccoli/react-lib-higher-level';
import { I18nProvider, useTranslation } from './i18n';
import { usePageTitle } from './use-page-title';
import { parseBookmarks, TAB, useBookmarks } from './use-bookmarks';

const THEME_STORAGE_KEY = 'bookmarks-react-theme';
const EMPTY_FORM = { label: '', target: '', subgroup: '' };
const EXPORT_FILENAME = 'bookmarks.json';
const JSON_TYPE = 'application/json';

function BookmarksPage() {
  const { t } = useTranslation();
  const { bookmarks, tab, setBookmarks, setTab, storageError } = useBookmarks();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pendingImport, setPendingImport] = useState<QuickLink[] | null>(null);
  usePageTitle(t(tab === TAB.MANAGE ? 'MANAGE' : 'BOOKMARKS'));
  const subgroups = [
    ...new Set(bookmarks.map(link => link.subgroup ?? '')),
  ].sort((a, b) => a.localeCompare(b));
  const reset = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError('');
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
      reset();
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
    reset();
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
            <form onSubmit={submit} className="space-y-3">
              <h2 className="font-semibold">
                {t(editing === null ? 'ADD' : 'EDIT')}
              </h2>
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
              <label className="block">
                {t('SUBGROUP')}
                <Input
                  list="subgroups"
                  value={form.subgroup}
                  onChange={e => setForm({ ...form, subgroup: e.target.value })}
                />
              </label>
              <datalist id="subgroups">
                {subgroups.filter(Boolean).map(group => (
                  <option key={group} value={group} />
                ))}
              </datalist>
              <div className="flex gap-2">
                <Button type="submit">
                  {t(editing === null ? 'ADD' : 'SAVE')}
                </Button>
                {editing !== null && (
                  <Button type="button" variant="outline" onClick={reset}>
                    {t('CANCEL')}
                  </Button>
                )}
              </div>
            </form>
            {error && (
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
                    reset();
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
                <h2 className="font-semibold">{group || t('UNGROUPED')}</h2>
                <ul className="space-y-2">
                  {bookmarks
                    .map((link, index) => ({ link, index }))
                    .filter(({ link }) => (link.subgroup ?? '') === group)
                    .map(({ link, index }) => (
                      <li
                        key={index}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{link.label}</p>
                          <p className="break-all text-sm text-muted-foreground">
                            {link.target}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditing(index);
                            setForm({
                              label: link.label,
                              target: link.target,
                              subgroup: link.subgroup ?? '',
                            });
                            setError('');
                          }}
                        >
                          {t('EDIT')}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm(t('CONFIRM_DELETE'))) {
                              setBookmarks(
                                bookmarks.filter((_, i) => i !== index),
                              );
                              reset();
                            }
                          }}
                        >
                          {t('DELETE')}
                        </Button>
                      </li>
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
