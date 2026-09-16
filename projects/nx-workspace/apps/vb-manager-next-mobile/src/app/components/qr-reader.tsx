'use client';

import { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { useQrReader } from '../hooks/use-qr-reader';

const LABEL_CAMERA = 'Camera';
const LABEL_GALLERY = 'Gallery';
const LABEL_OPEN_LINK = 'Open link';
const LABEL_COPY = 'Copy value';
const LABEL_SCAN_ANOTHER = 'Scan another';
const LABEL_DECODING = 'Looking for a QR code...';
const LABEL_NO_CODE_FOUND = 'No QR code found in the image.';
const LABEL_NOT_A_LINK = 'This QR code is not a link, so it cannot be opened.';
const COPY_RESET_MS = 2000;

const BUTTON_SECONDARY =
  'flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors';
const BUTTON_PRIMARY =
  'flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors';

export const QrReader = () => {
  const { status, value, url, error, decode, reset } = useQrReader();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const isDecoding = status === 'decoding';
  const isDone = status === 'done';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setCopied(false);
    decode(file);
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setCopied(false);
    reset();
  };

  const handleCopy = async () => {
    if (!value || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_RESET_MS);
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
          disabled={isDecoding}
          className={BUTTON_SECONDARY}
        >
          <Camera size={16} />
          {LABEL_CAMERA}
        </button>
        <button
          onClick={() => galleryInputRef.current?.click()}
          disabled={isDecoding}
          className={BUTTON_SECONDARY}
        >
          <ImageIcon size={16} />
          {LABEL_GALLERY}
        </button>
      </div>

      {isDecoding && (
        <div className="flex items-center gap-3 py-2">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">{LABEL_DECODING}</p>
        </div>
      )}

      {isDone && value && (
        <>
          <p className="w-full break-all border border-gray-200 rounded-xl bg-white px-4 py-3 text-sm text-gray-800">
            {value}
          </p>

          {!url && (
            <p className="px-1 text-sm text-gray-500">{LABEL_NOT_A_LINK}</p>
          )}

          <div className="flex gap-2">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={BUTTON_PRIMARY}
              >
                <ExternalLink size={16} />
                {LABEL_OPEN_LINK}
              </a>
            )}
            <button
              onClick={handleCopy}
              aria-label={LABEL_COPY}
              className={BUTTON_SECONDARY}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </>
      )}

      {isDone && !value && (
        <p className="px-1 text-sm text-gray-500">{LABEL_NO_CODE_FOUND}</p>
      )}

      {isDone && (
        <button onClick={handleReset} className={`${BUTTON_SECONDARY} w-full`}>
          {LABEL_SCAN_ANOTHER}
        </button>
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
