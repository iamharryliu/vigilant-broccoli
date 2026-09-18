const MAX_DIMENSION = 1024;
const QUALITY = 0.8;
const OUTPUT_MIME_TYPE = 'image/jpeg';

const OCR_MIN_DIMENSION = 1600;
const OCR_MAX_DIMENSION = 3500;
const GRAYSCALE_WEIGHTS = { r: 0.299, g: 0.587, b: 0.114 };

export const resizeImage = (
  file: File,
): Promise<{ base64: string; mimeType: string; previewUrl: string }> =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_DIMENSION / Math.max(img.width, img.height),
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas
          .getContext('2d')!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        const previewUrl = canvas.toDataURL(OUTPUT_MIME_TYPE, QUALITY);
        resolve({
          base64: previewUrl.split(',')[1],
          mimeType: OUTPUT_MIME_TYPE,
          previewUrl,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

const otsuThreshold = (histogram: number[], total: number) => {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumBelow = 0;
  let weightBelow = 0;
  let maxVariance = 0;
  let threshold = 0;

  for (let i = 0; i < 256; i++) {
    weightBelow += histogram[i];
    if (weightBelow === 0) continue;
    const weightAbove = total - weightBelow;
    if (weightAbove === 0) break;

    sumBelow += i * histogram[i];
    const meanBelow = sumBelow / weightBelow;
    const meanAbove = (sum - sumBelow) / weightAbove;
    const variance = weightBelow * weightAbove * (meanBelow - meanAbove) ** 2;

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
};

export const preprocessForOcr = (file: File): Promise<HTMLCanvasElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const largestSide = Math.max(img.width, img.height);
        const scale =
          largestSide < OCR_MIN_DIMENSION
            ? OCR_MIN_DIMENSION / largestSide
            : Math.min(1, OCR_MAX_DIMENSION / largestSide);

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;
        const gray = new Uint8ClampedArray(data.length / 4);
        const histogram = new Array(256).fill(0);

        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const value =
            GRAYSCALE_WEIGHTS.r * data[i] +
            GRAYSCALE_WEIGHTS.g * data[i + 1] +
            GRAYSCALE_WEIGHTS.b * data[i + 2];
          gray[p] = value;
          histogram[gray[p]]++;
        }

        const threshold = otsuThreshold(histogram, gray.length);

        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const value = gray[p] > threshold ? 255 : 0;
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
