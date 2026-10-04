import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from '../i18n';

const AlertDialogExample = () => {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-start gap-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">{t('ALERT_DIALOG.OPEN')}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ALERT_DIALOG.TITLE')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('ALERT_DIALOG.DESCRIPTION')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">{t('ALERT_DIALOG.CANCEL')}</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => setCount(value => value + 1)}
              >
                {t('ALERT_DIALOG.CONFIRM')}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status">{t('ALERT_DIALOG.COUNT', { count })}</p>
    </div>
  );
};

export const AlertDialogDemo = () => (
  <I18nProvider>
    <AlertDialogExample />
  </I18nProvider>
);
