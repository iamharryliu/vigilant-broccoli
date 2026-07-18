export type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

export const readImageAsBase64 = (file: File): Promise<UploadedImage> =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      resolve({
        name: file.name,
        base64: dataUrl.split(',')[1],
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  });
