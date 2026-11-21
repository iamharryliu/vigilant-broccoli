'use client';

import { Check, Copy, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';

const COPY = {
  TITLE: 'Share',
  COPY_LINK: 'Copy link',
  COPIED: 'Copied',
  QR_ALT: 'QR code for the note link',
  DOWNLOAD_QR: 'Download QR',
};
const QR_WIDTH = 224;
const QR_MARGIN = 2;
const COPIED_FEEDBACK_MS = 1500;

export interface ShareDialogProps {
  noteTitle: string;
  url: string | null;
  onOpenChange: (open: boolean) => void;
}

export const ShareDialog = ({
  noteTitle,
  url,
  onOpenChange,
}: ShareDialogProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setQrDataUrl(null);
    setCopied(false);
    if (!url) return;
    let cancelled = false;
    QRCode.toDataURL(url, { width: QR_WIDTH, margin: QR_MARGIN }).then(
      dataUrl => {
        if (!cancelled) setQrDataUrl(dataUrl);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${noteTitle.trim().replace(/[^\w-]+/g, '-') || 'note'}-qr.png`;
    link.click();
  };

  return (
    <Dialog open={url !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <DialogTitle className="truncate">{`${COPY.TITLE} ${noteTitle}`}</DialogTitle>
        <div
          className="flex items-center justify-center rounded-lg border bg-white p-3 dark:bg-white"
          style={{ minHeight: QR_WIDTH + 24 }}
        >
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt={COPY.QR_ALT}
              width={QR_WIDTH}
              height={QR_WIDTH}
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={copyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? COPY.COPIED : COPY.COPY_LINK}
          </Button>
          <Button variant="outline" onClick={downloadQr} disabled={!qrDataUrl}>
            <Download size={16} />
            {COPY.DOWNLOAD_QR}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
