import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';
import {
  Avatar,
  AvatarSize,
  BoringAvatarVariant,
  FALLBACK_TYPE,
  USER_AVATAR_COLORS,
} from '@vigilant-broccoli/react-lib';
import { Pencil } from 'lucide-react';

const SAMPLE_NAME = 'Harry Liu';

const SIZE_LABELS: Record<AvatarSize, string> = {
  xsmall: 'xs',
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

const SIZES: AvatarSize[] = ['xsmall', 'small', 'medium', 'large'];
const VARIANTS: BoringAvatarVariant[] = [
  'beam',
  'bauhaus',
  'marble',
  'ring',
  'sunset',
  'pixel',
];

export const AvatarDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.AVATAR.SIZES')}>
        <div className="flex flex-wrap items-center gap-4">
          {SIZES.map(size => (
            <Avatar
              key={size}
              size={size}
              fallback={{
                type: FALLBACK_TYPE.CHARACTER,
                value: SIZE_LABELS[size],
              }}
            />
          ))}
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.AVATAR.CHARACTER_FALLBACK')}>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar fallback={{ type: FALLBACK_TYPE.CHARACTER, value: 'A' }} />
          <Avatar fallback={{ type: FALLBACK_TYPE.CHARACTER, value: 'HL' }} />
        </div>
      </DemoSection>

      <DemoSection
        title={t('DEMO_SECTION.AVATAR.BORINGAVATAR_FALLBACK_VARIANTS')}
      >
        <div className="flex flex-wrap items-center gap-4">
          {VARIANTS.map(variant => (
            <Avatar
              key={variant}
              fallback={{
                type: FALLBACK_TYPE.BORING_AVATAR,
                name: `${SAMPLE_NAME}-${variant}`,
                variant,
                colors: USER_AVATAR_COLORS,
              }}
            />
          ))}
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.AVATAR.WITH_BADGE')}>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar
            fallback={{ type: FALLBACK_TYPE.CHARACTER, value: 'A' }}
            badge={{ icon: Pencil }}
          />
        </div>
      </DemoSection>
    </div>
  );
};
