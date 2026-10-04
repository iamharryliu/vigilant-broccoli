'use client';

import { cn } from '../utils/cn';
import { type QuickLink } from '@vigilant-broccoli/common-js';
import { CloseButton } from './CloseButton';
import {
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from './Dialog';
import { QuickLinksPanel, type ShellExecuteHandler } from './QuickLinksPanel';

const DIALOG_TITLE = 'Quick Links';
const DIALOG_MAX_WIDTH = 800;
const CLOSE_LABEL = 'Close';
const HEADER_CLASS = 'flex items-center justify-between gap-2 mb-3';
const CLOSE_BUTTON_CLASS = 'sm:hidden';

export type QuickLinksDialogProps = {
  links: QuickLink[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShellExecute?: ShellExecuteHandler;
};

export function QuickLinksDialog({
  links,
  open,
  onOpenChange,
  onShellExecute,
}: QuickLinksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className={cn(
          'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
          FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
        )}
        style={{
          maxWidth: DIALOG_MAX_WIDTH,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className={HEADER_CLASS}>
          <DialogTitle className="mb-0 text-xl font-bold leading-7 tracking-normal">
            {DIALOG_TITLE}
          </DialogTitle>
          <DialogClose asChild>
            <CloseButton
              aria-label={CLOSE_LABEL}
              className={CLOSE_BUTTON_CLASS}
            />
          </DialogClose>
        </div>

        <QuickLinksPanel
          links={links}
          onShellExecute={onShellExecute}
          autoFocusSearch={open}
          onLinkOpen={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
