import { MyCalendarView } from './components/my-calendar-view';
import { ProtectedRoute } from './components/protected-route';
import { QuickLinksPanel } from './components/quick-links-panel';
import { PAGE_HEIGHT } from './components/app-shell.constants';
import { PAGE_TITLE } from './app.const';

export const metadata = {
  title: PAGE_TITLE.HOME,
};

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className={`flex ${PAGE_HEIGHT} flex-col bg-gray-50`}>
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-5">
          <div className="min-h-0 flex-1">
            <MyCalendarView />
          </div>
          <QuickLinksPanel />
        </div>
      </main>
    </ProtectedRoute>
  );
}
