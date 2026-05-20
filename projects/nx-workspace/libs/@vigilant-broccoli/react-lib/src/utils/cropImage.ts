'use client';

import type { Area } from 'react-easy-crop';

const MAX_SIZE = 1_000_000;
const MIN_QUALITY = 0.1;
const QUALITY_STEP = 0.1;
const SCALE_FACTOR = 0.75;
const DEFAULT_OUTPUT_TYPE = 'image/webp';
const DEFAULT_QUALITY = 0.9;
const DEFAULT_MAX_OUTPUT_SIZE = 512;

interface CropImageOptions {
  outputType?: string;
  quality?: number;
  maxOutputSize?: number;
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas is empty'))),
      'image/webp',
      quality,
    ),
  );
}

async function compressImage(blob: Blob): Promise<Blob> {
  const img = await loadImageFromBlob(blob);
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  while (true) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');
    ctx.drawImage(img, 0, 0, width, height);

    for (
      let quality = DEFAULT_QUALITY;
      quality >= MIN_QUALITY;
      quality -= QUALITY_STEP
    ) {
      const result = await canvasToWebpBlob(canvas, quality);
      if (result.size <= MAX_SIZE) return result;
    }

    width = Math.round(width * SCALE_FACTOR);
    height = Math.round(height * SCALE_FACTOR);
  }
}

export async function getCroppedImageBlob(
  imageSrc: string,
  cropArea: Area,
  options: CropImageOptions = {},
): Promise<Blob> {
  const {
    outputType = DEFAULT_OUTPUT_TYPE,
    quality = DEFAULT_QUALITY,
    maxOutputSize = DEFAULT_MAX_OUTPUT_SIZE,
  } = options;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const outputSize = Math.min(cropArea.width, cropArea.height, maxOutputSize);
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      blobValue =>
        blobValue ? resolve(blobValue) : reject(new Error('Canvas is empty')),
      outputType,
      quality,
    ),
  );

  return compressImage(blob);
}
