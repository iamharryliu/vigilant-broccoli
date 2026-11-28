import { useState } from 'react';
import {
  Button,
  cn,
  DeleteItemConfirmationDialog,
  SyncedTextEditor,
  Text,
  useDocumentTitle,
} from '@vigilant-broccoli/react-lib';
import { MarkdownPreviewPane } from '@vigilant-broccoli/react-lib-higher-level';
import { useTranslation } from './i18n';
import { getNoteTitle } from './notepad.storage';
import { useNotes } from './use-notes';

export const NotepadPage = () => {
  const { t } = useTranslation();
  const { notes, selected, select, addNote, updateSelected, deleteNote } =
    useNotes();
  const [deleteOpen, setDeleteOpen] = useState(false);

  useDocumentTitle(`${t('NOTEPAD.PAGE_TITLE')} | ${t('NOTEPAD.APP_NAME')}`);

  return (
    <div className="flex h-[calc(100dvh-2rem)] flex-col gap-4 md:flex-row">
      <aside className="flex max-h-48 shrink-0 flex-col gap-2 md:max-h-none md:w-64">
        <div className="flex items-center justify-between gap-2">
          <Text size="3" weight="bold">
            {t('NOTEPAD.NOTES')}
          </Text>
          <Button size="sm" onClick={addNote}>
            {t('NOTEPAD.NEW_NOTE')}
          </Button>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {notes.map(note => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => select(note.id)}
                className={cn(
                  'w-full truncate rounded-md px-3 py-2 text-left text-sm hover:bg-accent',
                  note.id === selected.id && 'bg-accent font-medium',
                )}
              >
                {getNoteTitle(note, t('NOTEPAD.UNTITLED'))}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div className="flex justify-end">
          <Button
            variant="destructive-ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            {t('NOTEPAD.DELETE_NOTE')}
          </Button>
        </div>
        <MarkdownPreviewPane
          markdownPreview
          className="flex-1"
          content={selected.content}
          previewLabel={t('NOTEPAD.SHOW_PREVIEW')}
          editLabel={t('NOTEPAD.BACK_TO_EDITING')}
          renderEditor={() => (
            <SyncedTextEditor
              key={selected.id}
              content={selected.content}
              onChange={updateSelected}
              isLoading={false}
              placeholder={t('NOTEPAD.PLACEHOLDER')}
            />
          )}
        />
      </section>
      <DeleteItemConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('NOTEPAD.DELETE_TITLE')}
        description={t('NOTEPAD.DELETE_DESCRIPTION')}
        confirmLabel={t('NOTEPAD.DELETE')}
        cancelLabel={t('NOTEPAD.CANCEL')}
        deleteItem={async () => deleteNote(selected.id)}
      />
    </div>
  );
};
