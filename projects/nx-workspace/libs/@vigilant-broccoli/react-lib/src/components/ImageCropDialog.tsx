'use client';

import { useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
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

const DEFAULT_TITLE = 'Crop image';
const DEFAULT_DESCRIPTION = 'Position and zoom your image, then save.';
const ZOOM_LABEL = 'Zoom';
const CANCEL_LABEL = 'Cancel';
const SAVE_LABEL = 'Save';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.05;

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onSave: (croppedArea: Area) => Promise<void>;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
}

export function ImageCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onSave,
  isSubmitting = false,
  title,
  description,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  useEffect(() => {
    if (!open || !imageSrc) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  }, [open, imageSrc]);

  async function handleSave() {
    if (!croppedArea) return;
    await onSave(croppedArea);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title ?? DEFAULT_TITLE}</DialogTitle>
          <DialogDescription>
            {description ?? DEFAULT_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        {imageSrc ? (
          <div className="space-y-4">
            <div className="relative h-72 overflow-hidden rounded-md bg-black sm:h-96">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                  setCroppedArea(croppedAreaPixels)
                }
              />
            </div>
            <Input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={zoom}
              onChange={event => setZoom(Number(event.target.value))}
              className="w-full"
              aria-label={ZOOM_LABEL}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            {CANCEL_LABEL}
          </Button>
          <Button
            onClick={handleSave}
            loading={isSubmitting}
            disabled={!croppedArea}
          >
            {SAVE_LABEL}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
