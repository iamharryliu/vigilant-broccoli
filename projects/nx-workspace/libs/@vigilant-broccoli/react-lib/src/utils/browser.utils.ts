export const WINDOW_OPEN_FEATURES = 'noopener,noreferrer';

export const downloadBlob = (blob: Blob, filename: string): void => {
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export const downloadJson = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const filenameWithExtension = filename.endsWith('.json')
    ? filename
    : `${filename}.json`;
  downloadBlob(blob, filenameWithExtension);
};
