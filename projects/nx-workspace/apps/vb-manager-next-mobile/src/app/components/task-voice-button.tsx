'use client';

import { useVoiceInput } from '../hooks/use-voice-input';

export const TaskVoiceButton = ({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) => {
  const { recordingState, toggleRecording } = useVoiceInput(onTranscript);

  return (
    <button
      onClick={toggleRecording}
      disabled={recordingState === 'transcribing'}
      className={`flex-1 flex items-center justify-center gap-2 border rounded-lg px-3 py-2 text-sm transition-colors ${
        recordingState === 'recording'
          ? 'border-red-300 bg-red-50 text-red-600'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100'
      } disabled:opacity-50`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
      {recordingState === 'recording'
        ? 'Stop'
        : recordingState === 'transcribing'
          ? '...'
          : 'Voice'}
    </button>
  );
};
