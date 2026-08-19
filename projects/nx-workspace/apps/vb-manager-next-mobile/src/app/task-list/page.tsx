import { GoogleTaskList } from '../components/google-task-list';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_MIN_HEIGHT } from '../components/app-shell';

export default function TaskListPage() {
  return (
    <ProtectedRoute>
      <main className={`${PAGE_MIN_HEIGHT} bg-gray-50`}>
        <div className="px-4 py-5">
          <GoogleTaskList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
