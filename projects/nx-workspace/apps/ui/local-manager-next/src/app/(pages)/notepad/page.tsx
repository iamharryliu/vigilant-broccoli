'use client';

import { NotepadEditorComponent } from '../../components/notepad-editor.component';
import { NOTEPAD_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(NOTEPAD_ROUTE.title);
  return (
    <div className="h-full">
      <NotepadEditorComponent style={{ height: '100%' }} />
    </div>
  );
}
