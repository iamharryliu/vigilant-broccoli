import { EventCalendarsList } from '../components/event-calendars-list';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_MIN_HEIGHT } from '../components/app-shell';

export default function EventCalendarsPage() {
  return (
    <ProtectedRoute>
      <main className={`${PAGE_MIN_HEIGHT} bg-gray-50`}>
        <div className="px-4 py-5">
          <EventCalendarsList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
