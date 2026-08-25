import { GoogleTasksView } from '../components/google-tasks-view';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_MIN_HEIGHT } from '../components/app-shell.constants';

export default function TaskListPage() {
  return (
    <ProtectedRoute>
      <main className={`${PAGE_MIN_HEIGHT} bg-gray-50`}>
        <div className="px-4 py-5">
          <GoogleTasksView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
