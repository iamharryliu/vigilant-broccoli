// Downloads a blob as a file in the browser by creating a temporary link element
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

// Downloads JSON data as a file in the browser
export const downloadJson = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const filenameWithExtension = filename.endsWith('.json')
    ? filename
    : `${filename}.json`;
  downloadBlob(blob, filenameWithExtension);
};
