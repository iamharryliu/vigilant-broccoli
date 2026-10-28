'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { EmailMessageForm } from './EmailMessageForm';

type EmailModalComponentProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const EmailModalComponent = ({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: EmailModalComponentProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen ?? internalOpen;
  const setOpen = externalOnOpenChange ?? setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button size="icon" variant="secondary" aria-label="Send email">
            <EnvelopeClosedIcon />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
        aria-describedby={undefined}
        showCloseButton={false}
        style={{ maxWidth: '600px' }}
      >
        <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
          Send Email Message
        </DialogTitle>

        <EmailMessageForm
          defaultTo=""
          defaultSubject=""
          defaultText=""
          defaultHtml=""
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
