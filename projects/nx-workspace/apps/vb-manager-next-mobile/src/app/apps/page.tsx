import { AppsView } from '../components/apps-view';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_HEIGHT } from '../components/app-shell.constants';
import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.APPS,
};

export default function AppsPage() {
  return (
    <ProtectedRoute>
      <main
        className={`flex ${PAGE_HEIGHT} flex-col overflow-hidden bg-gray-50`}
      >
        <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
          <AppsView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
