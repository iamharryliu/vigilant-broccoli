import { PreviewDeploymentsView } from '../components/preview-deployments-view';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_HEIGHT } from '../components/app-shell.constants';
import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.PREVIEW_DEPLOYMENTS,
};

export default function PreviewDeploymentsPage() {
  return (
    <ProtectedRoute>
      <main
        className={`flex ${PAGE_HEIGHT} flex-col overflow-hidden bg-gray-50 dark:bg-gray-950`}
      >
        <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
          <PreviewDeploymentsView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
