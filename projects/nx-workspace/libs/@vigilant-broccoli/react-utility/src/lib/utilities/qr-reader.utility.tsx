'use client';

import {
  Button,
  CopyButton,
  Text,
  buttonVariants,
  cn,
} from '@vigilant-broccoli/react-lib';
import {
  Camera,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  QR_CONTENT_KIND_LABEL,
  type QrAction,
  type QrContent,
  parseQrContent,
} from '../qr-content.utils';
import { decodeQrFromFile } from '../qr.utils';

const LABEL_CAMERA = 'Camera';
const LABEL_GALLERY = 'Gallery';
const LABEL_DROP_ZONE = 'Drop an image here or click to upload';
const LABEL_DESTINATION = 'Opens';
const LABEL_SCAN_ANOTHER = 'Scan another';
const LABEL_SHOW_SECRET = 'Show';
const LABEL_HIDE_SECRET = 'Hide';
const SECRET_MASK = '••••••••';
const LABEL_DECODING = 'Looking for a QR code...';
const LABEL_NO_CODE_FOUND = 'No QR code found in the image.';
const ERROR_MESSAGE = 'Failed to read the image. Please try another one.';
const ERROR_NOT_AN_IMAGE = 'Only image files can be scanned.';
const IMAGE_MIME_PREFIX = 'image/';
const ACCEPT_IMAGES = 'image/*';
const CAPTURE_REAR_CAMERA = 'environment';
const ICON_SIZE = 16;
const EXTERNAL_TARGET = '_blank';
const EXTERNAL_REL = 'noopener noreferrer';

const STATUS = {
  IDLE: 'idle',
  DECODING: 'decoding',
  DONE: 'done',
} as const;

type QrReaderStatus = (typeof STATUS)[keyof typeof STATUS];

type QrImageSourceProps = {
  disabled: boolean;
  onFile: (file: File) => void;
};

const toFileChangeHandler =
  (onFile: (file: File) => void) =>
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFile(file);
  };

const CameraAndGalleryInputs = ({ disabled, onFile }: QrImageSourceProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const handleChange = toFileChangeHandler(onFile);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => cameraInputRef.current?.click()}
        disabled={disabled}
      >
        <Camera size={ICON_SIZE} />
        {LABEL_CAMERA}
      </Button>
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => galleryInputRef.current?.click()}
        disabled={disabled}
      >
        <ImageIcon size={ICON_SIZE} />
        {LABEL_GALLERY}
      </Button>
      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPT_IMAGES}
        capture={CAPTURE_REAR_CAMERA}
        onChange={handleChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={ACCEPT_IMAGES}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

const useFileDrop = (
  enabled: boolean,
  disabled: boolean,
  onFile: (file: File) => void,
) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !disabled) onFile(file);
  };

  return {
    isDragging: enabled && isDragging,
    dropHandlers: enabled
      ? {
          onDragOver: handleDragOver,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
        }
      : {},
  };
};

const UploadDropZone = ({
  disabled,
  isDragging,
  onFile,
}: QrImageSourceProps & { isDragging: boolean }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-sm text-muted-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50',
          isDragging ? 'border-primary bg-accent' : 'border-border',
        )}
      >
        <Upload size={ICON_SIZE} />
        {LABEL_DROP_ZONE}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_IMAGES}
        onChange={toFileChangeHandler(onFile)}
        className="hidden"
      />
    </>
  );
};

const QrFieldRow = ({
  label,
  value,
  copyable,
  secret,
}: QrContent['fields'][number]) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const isMasked = secret && !isRevealed;

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex-1 min-w-0">
        <Text as="p" size="1" color="gray">
          {label}
        </Text>
        <Text as="p" size="2" className="break-all">
          {isMasked ? SECRET_MASK : value}
        </Text>
      </div>
      {secret && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRevealed(revealed => !revealed)}
          aria-label={isRevealed ? LABEL_HIDE_SECRET : LABEL_SHOW_SECRET}
        >
          {isRevealed ? <EyeOff size={ICON_SIZE} /> : <Eye size={ICON_SIZE} />}
        </Button>
      )}
      {copyable && <CopyButton text={value} />}
    </div>
  );
};

const QrFieldList = ({ fields }: Pick<QrContent, 'fields'>) => (
  <div className="divide-y divide-border rounded-md border border-border bg-background">
    {fields.map((field, index) => (
      <QrFieldRow key={`${field.label}-${index}`} {...field} />
    ))}
  </div>
);

const QrActionLink = ({ action }: { action: QrAction }) => (
  <div className="space-y-1">
    <a
      href={action.href}
      target={action.external ? EXTERNAL_TARGET : undefined}
      rel={action.external ? EXTERNAL_REL : undefined}
      className={cn(buttonVariants(), 'w-full')}
    >
      <ExternalLink size={ICON_SIZE} />
      {action.label}
    </a>
    <Text as="p" size="1" color="gray" className="break-all">
      {LABEL_DESTINATION} {action.href}
    </Text>
  </div>
);

const QrDecodedValue = ({ value }: { value: string }) => {
  const content = parseQrContent(value);

  return (
    <>
      <div className="space-y-1">
        <Text as="p" size="1" weight="medium" color="gray">
          {QR_CONTENT_KIND_LABEL[content.kind]}
        </Text>
        <div className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2">
          <Text
            as="p"
            size="2"
            className="flex-1 whitespace-pre-wrap break-all"
          >
            {value}
          </Text>
          <CopyButton text={value} />
        </div>
      </div>

      {content.fields.length > 0 && <QrFieldList fields={content.fields} />}
      {content.action && <QrActionLink action={content.action} />}
    </>
  );
};

const QrResult = ({
  value,
  onReset,
}: {
  value: string | null;
  onReset: () => void;
}) => (
  <>
    {value ? (
      <QrDecodedValue value={value} />
    ) : (
      <Text as="p" size="2" color="gray">
        {LABEL_NO_CODE_FOUND}
      </Text>
    )}

    <Button variant="outline" className="w-full" onClick={onReset}>
      {LABEL_SCAN_ANOTHER}
    </Button>
  </>
);

export const QrReaderUtilityContent = ({
  uploadOnly = false,
}: {
  uploadOnly?: boolean;
}) => {
  const [status, setStatus] = useState<QrReaderStatus>(STATUS.IDLE);
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const isDecoding = status === STATUS.DECODING;
  const isDone = status === STATUS.DONE;

  const handleReset = () => {
    setImageUrl(null);
    setStatus(STATUS.IDLE);
    setValue(null);
    setError(null);
  };

  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl],
  );

  const handleFile = async (file: File) => {
    if (!file.type.startsWith(IMAGE_MIME_PREFIX)) {
      handleReset();
      setError(ERROR_NOT_AN_IMAGE);
      return;
    }
    setImageUrl(URL.createObjectURL(file));
    setStatus(STATUS.DECODING);
    setValue(null);
    setError(null);
    try {
      setValue(await decodeQrFromFile(file));
      setStatus(STATUS.DONE);
    } catch {
      setError(ERROR_MESSAGE);
      setStatus(STATUS.IDLE);
    }
  };

  const { isDragging, dropHandlers } = useFileDrop(
    uploadOnly,
    isDecoding,
    handleFile,
  );

  return (
    <div className="space-y-4" {...dropHandlers}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="w-full max-h-64 object-contain rounded-md border border-border bg-background"
        />
      )}

      {uploadOnly ? (
        <UploadDropZone
          disabled={isDecoding}
          isDragging={isDragging}
          onFile={handleFile}
        />
      ) : (
        <CameraAndGalleryInputs disabled={isDecoding} onFile={handleFile} />
      )}

      {isDecoding && (
        <Text as="p" size="2" color="gray">
          {LABEL_DECODING}
        </Text>
      )}

      {isDone && <QrResult value={value} onReset={handleReset} />}

      {error && (
        <Text as="p" size="2" color="red">
          {error}
        </Text>
      )}
    </div>
  );
};
