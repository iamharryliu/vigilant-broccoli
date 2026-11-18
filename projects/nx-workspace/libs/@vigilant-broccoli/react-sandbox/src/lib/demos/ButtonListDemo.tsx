import { ButtonList, type ButtonConfig } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const LABELS = [
  'GitHub',
  'Google',
  'YouTube',
  'LinkedIn',
  'Spotify',
  'Notion',
  'Figma',
  'Vercel',
  'Slack',
  'Discord',
  'Twitch',
  'Reddit',
  'Twitter',
  'Instagram',
  'Facebook',
  'TikTok',
  'AWS',
  'GCP',
  'Azure',
  'Cloudflare',
  'Heroku',
  'Railway',
  'Supabase',
  'Firebase',
];

const BUTTONS: ButtonConfig[] = LABELS.map(label => ({
  label,
  onClick: () => alert(label),
}));

const EXTERNAL_BUTTONS: ButtonConfig[] = LABELS.slice(0, 6).map(label => ({
  label,
  isExternal: true,
  onClick: () => alert(label),
}));

export function ButtonListDemo() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-8">
      <DemoSection title={t('DEMO_SECTION.BUTTON_LIST.DEFAULT')}>
        <ButtonList buttons={BUTTONS} />
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON_LIST.EXTERNAL')}>
        <ButtonList buttons={EXTERNAL_BUTTONS} />
      </DemoSection>
    </div>
  );
}
