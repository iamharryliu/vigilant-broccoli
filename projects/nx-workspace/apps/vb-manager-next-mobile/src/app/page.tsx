import { MyCalendarView } from './components/my-calendar-view';
import { ProtectedRoute } from './components/protected-route';
import { PAGE_HEIGHT_MOBILE_SCROLL } from './components/app-shell.constants';
import { PAGE_TITLE } from './app.const';

export const metadata = {
  title: PAGE_TITLE.HOME,
};

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className={`flex ${PAGE_HEIGHT_MOBILE_SCROLL} flex-col bg-gray-50`}>
        <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
          <MyCalendarView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
