'use client';

import { Settings } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { KeyBindingsEditor } from './KeyBindingsEditor';

export function KeyBindingsDialog({
  iconOnly = false,
}: {
  iconOnly?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={iconOnly ? 'ghost' : 'outline'}
          size={iconOnly ? 'icon' : 'sm'}
          className={iconOnly ? 'h-6 w-6' : 'self-start'}
          aria-label={t('SETTINGS.KEY_BINDINGS')}
          title={t('SETTINGS.KEY_BINDINGS')}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          {!iconOnly && t('SETTINGS.KEY_BINDINGS')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <KeyBindingsEditor />
      </DialogContent>
    </Dialog>
  );
}
