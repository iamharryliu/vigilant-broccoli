import { VoiceTranscriber } from '../components/voice-transcriber';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_MIN_HEIGHT } from '../components/app-shell.constants';
import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.TRANSCRIBE,
};

export default function TranscribePage() {
  return (
    <ProtectedRoute>
      <main className={`${PAGE_MIN_HEIGHT} bg-gray-50`}>
        <div className="px-4 py-5">
          <VoiceTranscriber />
        </div>
      </main>
    </ProtectedRoute>
  );
}
