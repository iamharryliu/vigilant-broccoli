'use client';

import { useState } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../../libs/auth';

export function QRCodeGenerator() {
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQrDataUrl(null);
    try {
      const res = await authFetch('/api/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate QR code');
      setQrDataUrl(data.dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={loading || !url}>
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {qrDataUrl && (
        <div className="flex flex-col items-center gap-2">
          <img src={qrDataUrl} alt="QR code" className="rounded-md" />
          <a
            href={qrDataUrl}
            download="qr-code.png"
            className="text-sm text-blue-500 hover:underline"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
