export const FILE_CONVERTER = {
  SIPS: 'sips',
  FFMPEG: 'ffmpeg',
  TEXTUTIL: 'textutil',
} as const;

export type FileConverter =
  (typeof FILE_CONVERTER)[keyof typeof FILE_CONVERTER];

export interface FileConversionCategory {
  label: string;
  converter: FileConverter;
  inputs: readonly string[];
  outputs: readonly string[];
}

export const AUDIO_OUTPUTS: readonly string[] = [
  'mp3',
  'wav',
  'm4a',
  'flac',
  'ogg',
];

// Converters are the host's CLI tools: sips and textutil ship with macOS,
// ffmpeg comes from Homebrew. sips reads webp but cannot write it.
export const FILE_CONVERSION_CATEGORIES: readonly FileConversionCategory[] = [
  {
    label: 'Image',
    converter: FILE_CONVERTER.SIPS,
    inputs: [
      'heic',
      'heif',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'tiff',
      'tif',
      'bmp',
      'webp',
    ],
    outputs: ['jpeg', 'png', 'heic', 'gif', 'tiff', 'bmp', 'pdf'],
  },
  {
    label: 'Audio',
    converter: FILE_CONVERTER.FFMPEG,
    inputs: ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'opus', 'aiff'],
    outputs: AUDIO_OUTPUTS,
  },
  {
    label: 'Video',
    converter: FILE_CONVERTER.FFMPEG,
    inputs: ['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi'],
    outputs: ['mp4', 'mov', 'webm', 'gif', 'mp3', 'wav'],
  },
  {
    label: 'Document',
    converter: FILE_CONVERTER.TEXTUTIL,
    inputs: ['txt', 'rtf', 'html', 'htm', 'doc', 'docx', 'odt'],
    outputs: ['txt', 'rtf', 'html', 'doc', 'docx', 'odt'],
  },
];

export const FILE_CONVERSION_FIELD = {
  FILE: 'file',
  TARGET: 'target',
} as const;

export const getFileExtension = (fileName: string) =>
  fileName.split('.').pop()?.toLowerCase() ?? '';

export const findFileConversionCategory = (fileName: string) => {
  const extension = getFileExtension(fileName);
  return FILE_CONVERSION_CATEGORIES.find(category =>
    category.inputs.includes(extension),
  );
};
