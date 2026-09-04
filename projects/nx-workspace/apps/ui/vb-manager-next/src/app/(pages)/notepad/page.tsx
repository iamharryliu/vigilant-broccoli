'use client';

import { NotepadEditorComponent } from '../../components/notepad-editor.component';
import { APP_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(APP_ROUTE.NOTEPAD.title);
  return (
    <div className="h-full">
      <NotepadEditorComponent style={{ height: '100%' }} />
    </div>
  );
}
