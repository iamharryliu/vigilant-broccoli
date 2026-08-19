import { NotepadEditor } from '../components/notepad-editor';
import { ProtectedRoute } from '../components/protected-route';

export default function NotepadPage() {
  return (
    <ProtectedRoute>
      <main className="flex flex-col h-screen bg-gray-50">
        <div className="flex flex-1 min-h-0 flex-col px-4 py-5">
          <NotepadEditor style={{ flex: 1 }} />
        </div>
      </main>
    </ProtectedRoute>
  );
}
