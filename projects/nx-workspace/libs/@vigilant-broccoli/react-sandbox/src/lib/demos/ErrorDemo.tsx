import { useState } from 'react';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Button,
  Callout,
  CalloutIcon,
  CalloutText,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@vigilant-broccoli/react-lib';

export const ErrorDemo = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const displayNotification = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const displayModal = () => {
    setShowModal(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {showAlert && (
        <Callout color="red">
          <CalloutIcon>
            <InfoCircledIcon />
          </CalloutIcon>
          <CalloutText>Error demo notification!</CalloutText>
        </Callout>
      )}

      <div className="flex gap-2">
        <Button variant="destructive" onClick={displayNotification}>
          Error Notification
        </Button>
        <Button variant="destructive" onClick={displayModal}>
          Error Modal
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
          showCloseButton={false}
          style={{ maxWidth: 450 }}
        >
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            Error Modal
          </DialogTitle>
          <DialogDescription className="text-sm mb-4">
            Error modal description.
          </DialogDescription>

          <div className="flex gap-3 mt-4 justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive">Confirm</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
