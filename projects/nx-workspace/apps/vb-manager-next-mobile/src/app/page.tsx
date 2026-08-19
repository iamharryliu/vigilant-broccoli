import { MyCalendarView } from './components/my-calendar-view';
import { ProtectedRoute } from './components/protected-route';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className="flex h-[calc(100dvh-var(--topbar-h))] flex-col bg-gray-50 md:h-dvh">
        <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
          <MyCalendarView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
