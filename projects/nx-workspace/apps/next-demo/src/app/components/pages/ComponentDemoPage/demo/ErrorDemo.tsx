import { Button, Heading } from '@radix-ui/themes';
import { useErrorContext } from '../../../providers/ErrorProvider';

export const ErrorDemo = () => {
  const { setAlert, setErrorModal } = useErrorContext();
  function displayNotification() {
    setAlert({ color: 'red', text: 'Error demo!' });
  }

  function displayModal() {
    setErrorModal({
      title: 'Error Modal',
      description: 'Error modal description.',
    });
  }
  return (
    <>
      <Heading>Error Demo</Heading>
      <div className="space-x-2">
        <Button color="red" onClick={displayNotification}>
          Error Notification
        </Button>
        <Button color="red" onClick={displayModal}>
          Error Modal
        </Button>
      </div>
    </>
  );
};
