import { MyCalendarView } from './components/my-calendar-view';
import { ProtectedRoute } from './components/protected-route';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col bg-gray-50">
        <div className="flex flex-1 flex-col px-4 py-5">
          <MyCalendarView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
