'use client';

import { useRef, useState } from 'react';
import { useOcr } from '../hooks/use-ocr';

const PLACEHOLDER = 'Extracted text will appear here...';
const COPY_IDLE = 'Copy';
const COPY_DONE = 'Copied!';
const COPY_RESET_MS = 2000;
const LABEL_CAMERA = 'Camera';
const LABEL_GALLERY = 'Gallery';
const LABEL_SCAN_ANOTHER = 'Scan another';
const LABEL_NO_TEXT_FOUND = 'No text found in the image.';

export const OcrScanner = () => {
  const { status, progress, text, error, recognize, reset, setText } = useOcr();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState(COPY_IDLE);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = status === 'processing';
  const isDone = status === 'done';
  const hasText = text.trim().length > 0;

  const handleFile = (file: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    recognize(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) handleFile(file);
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setCopyLabel(COPY_IDLE);
    reset();
  };

  const handleCopy = async () => {
    if (!hasText || !navigator.clipboard) return;
    await navigator.clipboard.writeText(text.trim());
    setCopyLabel(COPY_DONE);
    setTimeout(() => setCopyLabel(COPY_IDLE), COPY_RESET_MS);
  };

  return (
    <div className="space-y-4">
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="w-full max-h-64 object-contain rounded-xl border border-gray-200 bg-white"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors"
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
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {LABEL_CAMERA}
        </button>
        <button
          onClick={() => galleryInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors"
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {LABEL_GALLERY}
        </button>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-3 py-2">
          <svg
            className="w-5 h-5 animate-spin text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-sm text-gray-600">Reading text... {progress}%</p>
        </div>
      )}

      {isDone && (
        <>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={hasText ? undefined : PLACEHOLDER}
            rows={10}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
          />

          {!hasText && (
            <p className="text-sm text-gray-500 px-1">{LABEL_NO_TEXT_FOUND}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!hasText}
              className="flex-1 bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {copyLabel}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {LABEL_SCAN_ANOTHER}
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
