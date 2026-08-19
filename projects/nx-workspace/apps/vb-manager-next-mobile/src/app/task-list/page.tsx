import { GoogleTaskList } from '../components/google-task-list';
import { ProtectedRoute } from '../components/protected-route';

export default function TaskListPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <div className="px-4 py-5">
          <GoogleTaskList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
