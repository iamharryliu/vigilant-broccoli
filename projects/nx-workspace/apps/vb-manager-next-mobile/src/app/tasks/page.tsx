import { TasksInput } from '../components/tasks-input';
import { ProtectedRoute } from '../components/protected-route';

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 px-4 py-4 safe-top">
          <h1 className="text-lg font-semibold text-gray-800">Tasks</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Paste text or an image to create tasks
          </p>
        </header>
        <div className="px-4 py-5 pb-24">
          <TasksInput />
        </div>
      </main>
    </ProtectedRoute>
  );
}
