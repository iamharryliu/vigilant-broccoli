import { Flex, Heading } from '@radix-ui/themes';
import { toast, Toaster, Button } from '@vigilant-broccoli/react-lib';

const DEMO_DURATION_MS = 3000;

export function ToasterDemo() {
  return (
    <Flex direction="column" gap="6">
      <Toaster richColors duration={DEMO_DURATION_MS} />

      <div>
        <Heading size="4" mb="3">
          Toast Types
        </Heading>
        <Flex gap="3" wrap="wrap">
          <Button onClick={() => toast('Default toast message')}>
            Default
          </Button>
          <Button
            onClick={() => toast.success('Action completed successfully')}
          >
            Success
          </Button>
          <Button onClick={() => toast.error('Something went wrong')}>
            Error
          </Button>
          <Button onClick={() => toast.warning('Proceed with caution')}>
            Warning
          </Button>
          <Button onClick={() => toast.info('Here is some information')}>
            Info
          </Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          With Description
        </Heading>
        <Flex gap="3" wrap="wrap">
          <Button
            onClick={() =>
              toast('Event created', {
                description: 'Monday, January 3rd at 6:00pm',
              })
            }
          >
            With Description
          </Button>
          <Button
            onClick={() =>
              toast.success('Profile updated', {
                description: 'Your changes have been saved.',
              })
            }
          >
            Success + Description
          </Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          With Action
        </Heading>
        <Flex gap="3" wrap="wrap">
          <Button
            onClick={() =>
              toast('Item deleted', {
                action: {
                  label: 'Undo',
                  onClick: () => toast.success('Deletion undone'),
                },
              })
            }
          >
            With Undo Action
          </Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Promise
        </Heading>
        <Flex gap="3" wrap="wrap">
          <Button
            onClick={() =>
              toast.promise(new Promise(r => setTimeout(r, 2000)), {
                loading: 'Saving...',
                success: 'Saved successfully',
                error: 'Failed to save',
              })
            }
          >
            Promise Toast
          </Button>
        </Flex>
      </div>
    </Flex>
  );
}
