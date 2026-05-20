'use client';

import { ChangeEvent, ReactNode, useRef, useState } from 'react';
import { Area } from 'react-easy-crop';
import { Button } from './Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Dialog';
import { Input } from './Input';
import { ImageCropDialog } from './ImageCropDialog';
import { getCroppedImageBlob } from '../utils/cropImage';

const ACTION_TITLE = 'Update image';
const ACTION_DESCRIPTION = 'Upload a new image or remove the current one.';
const UPLOAD_LABEL = 'Upload';
const REMOVE_LABEL = 'Remove';
const CANCEL_LABEL = 'Cancel';
const DEFAULT_OUTPUT_TYPE = 'image/webp';

interface AvatarUploadHandlerProps {
  ariaLabel: string;
  hasImage?: boolean;
  fileName: string;
  onUpload: (blob: Blob) => Promise<void>;
  onRemove?: () => Promise<void>;
  renderTrigger: (props: {
    isBusy: boolean;
    openActionDialog: () => void;
  }) => ReactNode;
  title?: string;
  description?: string;
}

export function AvatarUploadHandler({
  ariaLabel,
  hasImage = false,
  fileName,
  onUpload,
  onRemove,
  renderTrigger,
  title,
  description,
}: AvatarUploadHandlerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  const isBusy = isUploading || isRemoving;

  function openFilePicker() {
    if (isBusy) return;
    setIsActionDialogOpen(false);
    fileInputRef.current?.click();
  }

  function openActionDialog() {
    if (isBusy) return;
    setIsActionDialogOpen(true);
  }

  function resetSelection() {
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(croppedArea: Area) {
    if (!imageSrc) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImageBlob(imageSrc, croppedArea);
      await onUpload(
        new File([croppedBlob], fileName, {
          type: croppedBlob.type || DEFAULT_OUTPUT_TYPE,
        }),
      );
      resetSelection();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (!onRemove) return;

    setIsRemoving(true);
    try {
      await onRemove();
      setIsActionDialogOpen(false);
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      {renderTrigger({ isBusy, openActionDialog })}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label={ariaLabel}
      />
      <Dialog
        open={isActionDialogOpen}
        onOpenChange={open => {
          if (!isBusy) setIsActionDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{ACTION_TITLE}</DialogTitle>
            <DialogDescription>{ACTION_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button onClick={openFilePicker} disabled={isBusy}>
              {UPLOAD_LABEL}
            </Button>
            {hasImage && onRemove ? (
              <Button
                variant="destructive"
                onClick={handleRemove}
                loading={isRemoving}
              >
                {REMOVE_LABEL}
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isBusy}
            >
              {CANCEL_LABEL}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ImageCropDialog
        open={Boolean(imageSrc)}
        imageSrc={imageSrc}
        onOpenChange={open => {
          if (!open) resetSelection();
        }}
        onSave={handleSave}
        isSubmitting={isUploading}
        title={title}
        description={description}
      />
    </>
  );
}
