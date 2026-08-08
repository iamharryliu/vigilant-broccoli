import { NotepadEditor } from '../components/notepad-editor';
import { ProtectedRoute } from '../components/protected-route';

export default function NotepadPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 px-4 py-4 safe-top">
          <h1 className="text-lg font-semibold text-gray-800">Notepad</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Synced across your devices
          </p>
        </header>
        <div className="px-4 py-5 pb-24">
          <NotepadEditor />
        </div>
      </main>
    </ProtectedRoute>
  );
}
