import { NotepadEditor } from '../components/notepad-editor';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_HEIGHT } from '../components/app-shell.constants';
import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.NOTEPAD,
};

export default function NotepadPage() {
  return (
    <ProtectedRoute>
      <main className={`flex flex-col ${PAGE_HEIGHT} bg-gray-50`}>
        <div className="flex flex-1 min-h-0 flex-col px-4 py-5">
          <NotepadEditor style={{ flex: 1 }} />
        </div>
      </main>
    </ProtectedRoute>
  );
}
