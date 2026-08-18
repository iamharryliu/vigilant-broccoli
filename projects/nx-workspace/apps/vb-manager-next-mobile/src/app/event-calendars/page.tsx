import { EventCalendarsList } from '../components/event-calendars-list';
import { ProtectedRoute } from '../components/protected-route';

export default function EventCalendarsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 px-4 py-4 safe-top">
          <h1 className="text-lg font-semibold text-gray-800">
            Event Calendars
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tap a calendar to open it, or copy its link
          </p>
        </header>
        <div className="px-4 py-5">
          <EventCalendarsList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
