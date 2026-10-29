'use client';

import { CircleHelp } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { ControlsHelpContent } from './ControlsHelpContent';

export function RulesHelpDialog({
  hasLocalPlayer = false,
  compact = false,
}: {
  hasLocalPlayer?: boolean;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={compact ? 'h-6 w-6' : undefined}
          aria-label={t('HOME.HOW_TO_PLAY')}
          title={t('HOME.HOW_TO_PLAY')}
        >
          <CircleHelp
            className={compact ? 'h-4 w-4' : 'h-5 w-5'}
            aria-hidden="true"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('HOME.HOW_TO_PLAY')}</DialogTitle>
          <DialogDescription>{t('HOME.GOAL')}</DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
          <li>{t('HOME.RULE_SPLASH')}</li>
          <li>{t('HOME.RULE_POWER_UPS')}</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          {t('HOME.RULE_SUDDEN_DEATH')}
        </p>
        <section className="mt-2 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t('CONTROLS.TITLE')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('CONTROLS.DESCRIPTION')}
            </p>
          </div>
          <ControlsHelpContent hasLocalPlayer={hasLocalPlayer} />
        </section>
      </DialogContent>
    </Dialog>
  );
}
