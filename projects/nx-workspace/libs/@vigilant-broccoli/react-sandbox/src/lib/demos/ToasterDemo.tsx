import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';
import { Button } from '@vigilant-broccoli/react-lib';
import { toast, Toaster } from '@vigilant-broccoli/react-lib/toaster';

const DEMO_DURATION_MS = 3000;

export function ToasterDemo() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <Toaster richColors duration={DEMO_DURATION_MS} />

      <DemoSection title={t('DEMO_SECTION.TOASTER.TOAST_TYPES')}>
        <div className="flex gap-3 flex-wrap">
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
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.TOASTER.WITH_DESCRIPTION')}>
        <div className="flex gap-3 flex-wrap">
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
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.TOASTER.WITH_ACTION')}>
        <div className="flex gap-3 flex-wrap">
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
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.TOASTER.PROMISE')}>
        <div className="flex gap-3 flex-wrap">
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
        </div>
      </DemoSection>
    </div>
  );
}
