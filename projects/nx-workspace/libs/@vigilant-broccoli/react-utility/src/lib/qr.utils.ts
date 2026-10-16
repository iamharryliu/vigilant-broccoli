import type { QRCode } from 'jsqr';

const DECODE_TARGET_SIDES = [1000, 2000, 500];
const INVERSION_ATTEMPTS = 'attemptBoth';
const OPENABLE_PROTOCOLS = ['http:', 'https:'];
const BARE_DOMAIN_PATTERN = /^([\w-]+\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i;
const HTTPS_PREFIX = 'https://';
const ERROR_UNREADABLE_IMAGE = 'Unreadable image';

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(ERROR_UNREADABLE_IMAGE));
    };
    image.src = objectUrl;
  });

const toImageData = (image: HTMLImageElement, targetSide: number) => {
  const scale = targetSide / Math.max(image.width, image.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
};

export const decodeQrFromFile = async (file: File): Promise<string | null> => {
  const [{ default: jsQR }, image] = await Promise.all([
    import('jsqr'),
    loadImage(file),
  ]);

  for (const targetSide of DECODE_TARGET_SIDES) {
    const { data, width, height } = toImageData(image, targetSide);
    const found: QRCode | null = jsQR(data, width, height, {
      inversionAttempts: INVERSION_ATTEMPTS,
    });
    if (found?.data) return found.data;
  }

  return null;
};

export const toOpenableUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = BARE_DOMAIN_PATTERN.test(trimmed)
    ? `${HTTPS_PREFIX}${trimmed}`
    : trimmed;
  try {
    const url = new URL(candidate);
    return OPENABLE_PROTOCOLS.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
