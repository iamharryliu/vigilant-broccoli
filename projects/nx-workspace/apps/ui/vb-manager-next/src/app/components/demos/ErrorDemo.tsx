import { useState } from 'react';
import { Button, Flex, Callout, Dialog, Heading, Text } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';

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
    <Flex direction="column" gap="4">
      {showAlert && (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>Error demo notification!</Callout.Text>
        </Callout.Root>
      )}

      <Flex gap="2">
        <Button color="red" onClick={displayNotification}>
          Error Notification
        </Button>
        <Button color="red" onClick={displayModal}>
          Error Modal
        </Button>
      </Flex>

      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Error Modal</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Error modal description.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button color="red">Confirm</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
};
