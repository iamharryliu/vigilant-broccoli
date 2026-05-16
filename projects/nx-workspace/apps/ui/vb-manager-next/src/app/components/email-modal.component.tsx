'use client';

import { useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <Dialog.Trigger>
          <Button size="icon" variant="secondary" aria-label="Send email">
            <EnvelopeClosedIcon />
          </Button>
        </Dialog.Trigger>
      )}

      <Dialog.Content maxWidth="600px">
        <Dialog.Title>Send Email Message</Dialog.Title>

        <EmailMessageForm
          defaultTo=""
          defaultSubject=""
          defaultText=""
          defaultHtml=""
          onSuccess={() => setOpen(false)}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};
