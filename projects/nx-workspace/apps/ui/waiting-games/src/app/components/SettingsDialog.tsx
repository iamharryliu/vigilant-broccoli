import { ChangeEvent, useEffect, useId, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@vigilant-broccoli/react-lib';
import { PHASE } from '../consts/game.consts';
import {
  SETTING_KEY,
  SETTING_LIMITS,
  SettingKey,
  Settings,
} from '../consts/settings.consts';
import { PHASE_COLOR } from '../consts/theme.consts';
import { useTranslation } from '../i18n';
import { clampSetting } from '../settings';

type TimingFieldProps = {
  settingKey: SettingKey;
  label: string;
  help: string;
  dotClass: string;
  value: number;
  onChange: (key: SettingKey, value: number) => void;
};

const TimingField = ({
  settingKey,
  label,
  help,
  dotClass,
  value,
  onChange,
}: TimingFieldProps) => {
  const { t } = useTranslation();
  const id = useId();
  const { min, max, step } = SETTING_LIMITS[settingKey];
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setDraft(text);
    const parsed = Number(text);
    if (
      text.trim() &&
      Number.isInteger(parsed) &&
      parsed >= min &&
      parsed <= max
    ) {
      onChange(settingKey, parsed);
    }
  };

  const handleBlur = () => {
    const parsed = Number(draft);
    const committed =
      draft.trim() && Number.isFinite(parsed)
        ? clampSetting(settingKey, parsed)
        : value;
    onChange(settingKey, committed);
    setDraft(String(committed));
  };

  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-base font-semibold"
      >
        <span
          aria-hidden="true"
          className={`h-3 w-3 rounded-full ${dotClass}`}
        />
        {label}
      </label>
      <p id={`${id}-help`} className="text-sm text-muted-foreground">
        {help}
      </p>
      <div className="flex items-center gap-3">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-describedby={`${id}-help ${id}-range`}
          className="h-11 w-24 text-lg"
        />
        <span id={`${id}-range`} className="text-sm text-muted-foreground">
          {t('SETTINGS.RANGE', { min, max })}
        </span>
      </div>
    </div>
  );
};

type SettingsDialogProps = {
  settings: Settings;
  onChange: (key: SettingKey, value: number) => void;
  onReset: () => void;
  onOpenChange: (open: boolean) => void;
};

export const SettingsDialog = ({
  settings,
  onChange,
  onReset,
  onOpenChange,
}: SettingsDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-11 w-11 rounded-full shadow-md"
          aria-label={t('CONTROLS.SETTINGS')}
          title={t('CONTROLS.SETTINGS')}
        >
          <SettingsIcon size={20} aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('SETTINGS.TITLE')}</DialogTitle>
          <DialogDescription>{t('SETTINGS.DESCRIPTION')}</DialogDescription>
        </DialogHeader>
        <fieldset className="grid gap-5">
          <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t('SETTINGS.TIMING_LEGEND')}
          </legend>
          <p className="text-sm text-muted-foreground">
            {t('SETTINGS.TIMING_HELP')}
          </p>
          <TimingField
            settingKey={SETTING_KEY.THINKING}
            label={t('SETTINGS.THINKING.LABEL')}
            help={t('SETTINGS.THINKING.HELP')}
            dotClass={PHASE_COLOR[PHASE.THINKING].dot}
            value={settings.thinkingSeconds}
            onChange={onChange}
          />
          <TimingField
            settingKey={SETTING_KEY.REVEAL}
            label={t('SETTINGS.REVEAL.LABEL')}
            help={t('SETTINGS.REVEAL.HELP')}
            dotClass={PHASE_COLOR[PHASE.REVEAL].dot}
            value={settings.revealSeconds}
            onChange={onChange}
          />
          <TimingField
            settingKey={SETTING_KEY.BREAK}
            label={t('SETTINGS.BREAK.LABEL')}
            help={t('SETTINGS.BREAK.HELP')}
            dotClass={PHASE_COLOR[PHASE.BREAK].dot}
            value={settings.breakSeconds}
            onChange={onChange}
          />
        </fieldset>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onReset}>
            {t('SETTINGS.RESET')}
          </Button>
          <DialogClose asChild>
            <Button>{t('SETTINGS.DONE')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
