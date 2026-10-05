const MAX_DIMENSION = 1024;
const QUALITY = 0.8;
const OUTPUT_MIME_TYPE = 'image/jpeg';

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
