import { TasksInput } from '../components/tasks-input';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_MIN_HEIGHT } from '../components/app-shell.constants';
import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.TASKS,
};

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <main className={`${PAGE_MIN_HEIGHT} bg-gray-50`}>
        <div className="px-4 py-5">
          <TasksInput />
        </div>
      </main>
    </ProtectedRoute>
  );
}
