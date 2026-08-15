'use client';

import { useEffect, useState } from 'react';

import { IconButton, Text } from '@vigilant-broccoli/react-lib';
import { ROUTES } from '../../lib/routes';

const QR_CODE_ENDPOINT = '/api/qr-code';
const DOWNLOAD_FILENAME_SUFFIX = '-qr-code.png';
const QR_IMAGE_MIME_TYPE = 'image/png';
const FEEDBACK_RESET_MS = 1500;

type Props = {
  itemId: string;
  title: string;
};

export const WhereIsLabel = ({ itemId, title }: Props) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [detailUrl, setDetailUrl] = useState<string | null>(null);
  const [imageCopied, setImageCopied] = useState(false);
  const [linkShared, setLinkShared] = useState(false);
  const canCopyImage =
    typeof window !== 'undefined' && 'ClipboardItem' in window;
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  useEffect(() => {
    const url = `${window.location.origin}${ROUTES.WHERE_IS_DETAIL(itemId)}`;
    setDetailUrl(url);
    fetch(QR_CODE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then(r => r.json())
      .then(data => setQrDataUrl(data.dataUrl));
  }, [itemId]);

  if (!qrDataUrl || !detailUrl) return null;

  const getQrBlob = () => fetch(qrDataUrl).then(r => r.blob());

  const handleDownload = async () => {
    const blob = await getQrBlob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${title}${DOWNLOAD_FILENAME_SUFFIX}`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleCopyImage = async () => {
    const blob = await getQrBlob();
    await navigator.clipboard.write([
      new ClipboardItem({ [QR_IMAGE_MIME_TYPE]: blob }),
    ]);
    setImageCopied(true);
    setTimeout(() => setImageCopied(false), FEEDBACK_RESET_MS);
  };

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({ title, url: detailUrl });
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') throw error;
      }
      return;
    }
    await navigator.clipboard.writeText(detailUrl);
    setLinkShared(true);
    setTimeout(() => setLinkShared(false), FEEDBACK_RESET_MS);
  };

  return (
    <div className="flex flex-col items-center gap-2 border border-gray-200 rounded-lg p-4 print:border-none print:justify-center print:h-screen">
      <Text size="4" weight="bold" className="text-center">
        {title}
      </Text>
      <img
        src={qrDataUrl}
        alt={`QR code linking to ${title}`}
        className="h-40 w-40"
      />
      <div className="flex items-center gap-1 print:hidden">
        <IconButton
          variant="outline"
          icon="download"
          aria-label="Save image"
          onClick={handleDownload}
        />
        {canCopyImage && (
          <IconButton
            variant="outline"
            icon={imageCopied ? 'check' : 'copy'}
            aria-label="Copy image"
            onClick={handleCopyImage}
          />
        )}
        <IconButton
          variant="outline"
          icon={linkShared ? 'check' : 'share'}
          aria-label="Share link"
          onClick={handleShare}
        />
        <IconButton
          variant="outline"
          icon="printer"
          aria-label="Print label"
          onClick={() => window.print()}
        />
      </div>
    </div>
  );
};
