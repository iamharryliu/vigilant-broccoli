'use client';

import { useState } from 'react';
import { Dialog, IconButton } from '@radix-ui/themes';
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
          <IconButton variant="soft" aria-label="Send email">
            <EnvelopeClosedIcon />
          </IconButton>
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
