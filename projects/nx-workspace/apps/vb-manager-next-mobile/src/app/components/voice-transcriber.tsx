'use client';

import { useState } from 'react';
import { useVoiceInput } from '../hooks/use-voice-input';

const PLACEHOLDER =
  'Tap the mic and start speaking — your transcript appears here...';
const LABEL_RECORD = 'Record';
const LABEL_STOP = 'Stop';
const LABEL_TRANSCRIBING = 'Transcribing...';
const LABEL_CLEAR = 'Clear';
const COPY_IDLE = 'Copy';
const COPY_DONE = 'Copied!';
const COPY_RESET_MS = 2000;

export const VoiceTranscriber = () => {
  const [transcript, setTranscript] = useState('');
  const [copyLabel, setCopyLabel] = useState(COPY_IDLE);

  const { recordingState, voiceError, interimTranscript, toggleRecording } =
    useVoiceInput(text =>
      setTranscript(prev => (prev ? `${prev} ${text}` : text)),
    );

  const isRecording = recordingState === 'recording';
  const isTranscribing = recordingState === 'transcribing';
  const hasText = transcript.trim().length > 0;

  const handleCopy = async () => {
    if (!hasText || !navigator.clipboard) return;
    await navigator.clipboard.writeText(transcript.trim());
    setCopyLabel(COPY_DONE);
    setTimeout(() => setCopyLabel(COPY_IDLE), COPY_RESET_MS);
  };

  const recordLabel = isRecording
    ? LABEL_STOP
    : isTranscribing
      ? LABEL_TRANSCRIBING
      : LABEL_RECORD;

  return (
    <div className="space-y-4">
      <textarea
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={10}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
      />

      {isRecording && interimTranscript && (
        <p className="text-sm text-gray-400 italic px-1">{interimTranscript}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={toggleRecording}
          disabled={isTranscribing}
          className={`flex-[2] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          }`}
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
          {recordLabel}
        </button>
        <button
          onClick={handleCopy}
          disabled={!hasText}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {copyLabel}
        </button>
        <button
          onClick={() => setTranscript('')}
          disabled={!hasText}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {LABEL_CLEAR}
        </button>
      </div>

      {voiceError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {voiceError}
        </p>
      )}
    </div>
  );
};
