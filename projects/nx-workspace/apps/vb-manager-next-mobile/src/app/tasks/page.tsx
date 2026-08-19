import { TasksInput } from '../components/tasks-input';
import { ProtectedRoute } from '../components/protected-route';

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <div className="px-4 py-5">
          <TasksInput />
        </div>
      </main>
    </ProtectedRoute>
  );
}
