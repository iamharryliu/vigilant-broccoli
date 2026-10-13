import { Pause, Play, SkipForward } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { SettingKey, Settings } from '../consts/settings.consts';
import { useTranslation } from '../i18n';
import { SettingsDialog } from './SettingsDialog';

const CONTROL_BUTTON_CLASS = 'h-11 w-11 rounded-full shadow-md';
const ICON_SIZE = 20;

type GameControlsProps = {
  paused: boolean;
  awake: boolean;
  settings: Settings;
  onTogglePause: () => void;
  onSkip: () => void;
  onSettingChange: (key: SettingKey, value: number) => void;
  onSettingsReset: () => void;
  onSettingsOpenChange: (open: boolean) => void;
};

export const GameControls = ({
  paused,
  awake,
  settings,
  onTogglePause,
  onSkip,
  onSettingChange,
  onSettingsReset,
  onSettingsOpenChange,
}: GameControlsProps) => {
  const { t } = useTranslation();
  const pauseLabel = paused ? t('CONTROLS.RESUME') : t('CONTROLS.PAUSE');
  const PauseIcon = paused ? Play : Pause;

  return (
    <div
      role="group"
      aria-label={t('CONTROLS.GROUP_LABEL')}
      data-awake={awake}
      data-paused={paused}
      className="absolute right-3 top-3 z-20 flex items-center gap-2 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100 data-[awake=true]:opacity-100 data-[paused=true]:opacity-100 [@media(hover:none)]:opacity-70 sm:right-5 sm:top-5"
    >
      {paused && (
        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
          {t('STATUS.PAUSED')}
        </span>
      )}
      <Button
        variant="secondary"
        size="icon"
        className={CONTROL_BUTTON_CLASS}
        aria-label={pauseLabel}
        title={pauseLabel}
        onClick={onTogglePause}
      >
        <PauseIcon size={ICON_SIZE} aria-hidden="true" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={CONTROL_BUTTON_CLASS}
        aria-label={t('CONTROLS.SKIP')}
        title={t('CONTROLS.SKIP')}
        onClick={onSkip}
      >
        <SkipForward size={ICON_SIZE} aria-hidden="true" />
      </Button>
      <SettingsDialog
        settings={settings}
        onChange={onSettingChange}
        onReset={onSettingsReset}
        onOpenChange={onSettingsOpenChange}
      />
    </div>
  );
};
