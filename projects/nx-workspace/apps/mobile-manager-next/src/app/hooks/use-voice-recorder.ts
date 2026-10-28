'use client';

import { useRef, useState } from 'react';
import { buildAuthHeaders } from '../providers/auth-provider';

type RecordingState = 'idle' | 'recording' | 'transcribing';

export const useVoiceRecorder = (onTranscript: (text: string) => void) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setVoiceError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setVoiceError('Microphone access denied');
      return;
    }
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setRecordingState('transcribing');
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: await buildAuthHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setVoiceError(data.error ?? 'Transcription failed');
      } else {
        onTranscript(data.text);
      }
      setRecordingState('idle');
    };

    mediaRecorder.start();
    setRecordingState('recording');
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const toggleRecording = () => {
    if (recordingState === 'idle') startRecording();
    else if (recordingState === 'recording') stopRecording();
  };

  return { recordingState, voiceError, toggleRecording };
};
