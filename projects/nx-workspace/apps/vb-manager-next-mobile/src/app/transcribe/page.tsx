import { VoiceTranscriber } from '../components/voice-transcriber';
import { ProtectedRoute } from '../components/protected-route';

export default function TranscribePage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <div className="px-4 py-5">
          <VoiceTranscriber />
        </div>
      </main>
    </ProtectedRoute>
  );
}
