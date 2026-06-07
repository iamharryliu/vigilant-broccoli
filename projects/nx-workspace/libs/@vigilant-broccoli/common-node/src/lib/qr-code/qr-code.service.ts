import QRCode from 'qrcode';

export const QRCodeService = {
  generateDataUrl: (url: string): Promise<string> =>
    QRCode.toDataURL(url, { width: 300, margin: 2 }),
};
