import { useState } from 'react';
import { Callout, Dialog } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Button } from '@vigilant-broccoli/react-lib';

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
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>Error demo notification!</Callout.Text>
        </Callout.Root>
      )}

      <div className="flex gap-2">
        <Button variant="destructive" onClick={displayNotification}>
          Error Notification
        </Button>
        <Button variant="destructive" onClick={displayModal}>
          Error Modal
        </Button>
      </div>

      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Error Modal</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Error modal description.
          </Dialog.Description>

          <div className="flex gap-3 mt-4 justify-end">
            <Dialog.Close>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button variant="destructive">Confirm</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};
