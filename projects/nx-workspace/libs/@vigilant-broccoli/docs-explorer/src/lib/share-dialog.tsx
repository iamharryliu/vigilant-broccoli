'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  IconButton,
  Input,
} from '@vigilant-broccoli/react-lib';

const COPY = {
  TITLE: 'Share note',
  COPY_LINK: 'Copy link',
  COPIED: 'Copied',
  QR_ALT: 'QR code for the note link',
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

  return (
    <Dialog open={url !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{COPY.TITLE}</DialogTitle>
        <DialogDescription className="truncate">{noteTitle}</DialogDescription>
        <div className="flex items-center gap-2">
          <Input readOnly value={url ?? ''} onFocus={e => e.target.select()} />
          <IconButton
            icon={copied ? 'check' : 'copy'}
            variant="ghost"
            aria-label={copied ? COPY.COPIED : COPY.COPY_LINK}
            title={copied ? COPY.COPIED : COPY.COPY_LINK}
            onClick={copyLink}
          />
        </div>
        <div className="flex justify-center">
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt={COPY.QR_ALT}
              width={QR_WIDTH}
              height={QR_WIDTH}
              className="rounded-md bg-white dark:bg-white"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
