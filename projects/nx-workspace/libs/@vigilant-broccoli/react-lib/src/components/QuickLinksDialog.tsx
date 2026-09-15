'use client';

import { Dialog } from '@radix-ui/themes';
import { type QuickLink } from '@vigilant-broccoli/common-js';
import { CloseButton } from './CloseButton';
import { FULL_SCREEN_ON_MOBILE_DIALOG_CLASS } from './Dialog';
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
        style={{
          maxWidth: DIALOG_MAX_WIDTH,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className={HEADER_CLASS}>
          <Dialog.Title mb="0">{DIALOG_TITLE}</Dialog.Title>
          <Dialog.Close>
            <CloseButton
              aria-label={CLOSE_LABEL}
              className={CLOSE_BUTTON_CLASS}
            />
          </Dialog.Close>
        </div>

        <QuickLinksPanel
          links={links}
          onShellExecute={onShellExecute}
          autoFocusSearch={open}
          onLinkOpen={() => onOpenChange(false)}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
