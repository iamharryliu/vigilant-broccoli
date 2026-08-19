import { EventCalendarsList } from '../components/event-calendars-list';
import { ProtectedRoute } from '../components/protected-route';

export default function EventCalendarsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <div className="px-4 py-5">
          <EventCalendarsList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
