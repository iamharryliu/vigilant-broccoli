import { SettingsView } from '../components/settings-view';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_HEIGHT } from '../components/app-shell.constants';
import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.SETTINGS,
};

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <main
        className={`flex ${PAGE_HEIGHT} flex-col overflow-hidden bg-gray-50 dark:bg-gray-950`}
      >
        <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
          <SettingsView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
