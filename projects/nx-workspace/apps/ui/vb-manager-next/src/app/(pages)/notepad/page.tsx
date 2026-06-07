'use client';

import { NotepadEditorComponent } from '../../components/notepad-editor.component';

export default function Page() {
  return (
    <div className="h-full">
      <NotepadEditorComponent style={{ height: '100%' }} />
    </div>
  );
}
