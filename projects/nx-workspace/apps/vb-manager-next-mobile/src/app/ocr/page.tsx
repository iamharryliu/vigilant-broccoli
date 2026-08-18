import { OcrScanner } from '../components/ocr-scanner';
import { ProtectedRoute } from '../components/protected-route';

export default function OcrPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 px-4 py-4 safe-top">
          <h1 className="text-lg font-semibold text-gray-800">Scan Text</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Take a picture, then copy the text
          </p>
        </header>
        <div className="px-4 py-5">
          <OcrScanner />
        </div>
      </main>
    </ProtectedRoute>
  );
}
