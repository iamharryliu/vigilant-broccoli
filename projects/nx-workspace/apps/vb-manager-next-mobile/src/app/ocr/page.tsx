import { OcrScanner } from '../components/ocr-scanner';
import { ProtectedRoute } from '../components/protected-route';

export default function OcrPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <div className="px-4 py-5">
          <OcrScanner />
        </div>
      </main>
    </ProtectedRoute>
  );
}
