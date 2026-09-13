'use client';

import { Dialog } from '@radix-ui/themes';
import { type QuickLink } from '@vigilant-broccoli/common-js';
import { QuickLinksPanel, type ShellExecuteHandler } from './QuickLinksPanel';

const DIALOG_TITLE = 'Quick Links';
const DIALOG_MAX_WIDTH = 800;

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
        style={{
          maxWidth: DIALOG_MAX_WIDTH,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Dialog.Title>{DIALOG_TITLE}</Dialog.Title>

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
