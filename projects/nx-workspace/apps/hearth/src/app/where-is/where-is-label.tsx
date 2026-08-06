'use client';

import { useEffect, useState } from 'react';
import { Text } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { ROUTES } from '../../lib/routes';

const QR_CODE_ENDPOINT = '/api/qr-code';
const PRINT_LABEL = 'Print Label';

type Props = {
  itemId: string;
  title: string;
};

export const WhereIsLabel = ({ itemId, title }: Props) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const detailUrl = `${window.location.origin}${ROUTES.WHERE_IS_DETAIL(itemId)}`;
    fetch(QR_CODE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: detailUrl }),
    })
      .then(r => r.json())
      .then(data => setQrDataUrl(data.dataUrl));
  }, [itemId]);

  if (!qrDataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-3 print:justify-center print:h-screen">
      <div className="flex flex-col items-center gap-2 border border-gray-200 rounded-lg p-4 print:border-none">
        <img
          src={qrDataUrl}
          alt={`QR code linking to ${title}`}
          className="h-40 w-40"
        />
        <Text size="2" weight="medium">
          {title}
        </Text>
      </div>
      <Button
        variant="outline"
        onClick={() => window.print()}
        className="print:hidden"
      >
        {PRINT_LABEL}
      </Button>
    </div>
  );
};
