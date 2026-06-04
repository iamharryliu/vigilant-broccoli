import { Text } from '@radix-ui/themes';
import {
  Avatar,
  AvatarSize,
  BoringAvatarVariant,
  FALLBACK_TYPE,
  USER_AVATAR_COLORS,
} from '@vigilant-broccoli/react-lib';
import { Pencil } from 'lucide-react';

const SAMPLE_NAME = 'Harry Liu';

const SECTION_HEADING_PROPS = {
  as: 'p',
  size: '2',
  weight: 'bold',
  mb: '2',
} as const;

const ROW_FLEX_PROPS = { align: 'center', gap: '4' } as const;

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

export const AvatarDemo = () => (
  <div className="flex flex-col gap-6">
    <div>
      <Text {...SECTION_HEADING_PROPS}>Sizes</Text>
      <div className="flex" {...ROW_FLEX_PROPS}>
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
    </div>

    <div>
      <Text {...SECTION_HEADING_PROPS}>Character fallback</Text>
      <div className="flex" {...ROW_FLEX_PROPS}>
        <Avatar fallback={{ type: FALLBACK_TYPE.CHARACTER, value: 'A' }} />
        <Avatar fallback={{ type: FALLBACK_TYPE.CHARACTER, value: 'HL' }} />
      </div>
    </div>

    <div>
      <Text {...SECTION_HEADING_PROPS}>BoringAvatar fallback (variants)</Text>
      <div className="flex" {...ROW_FLEX_PROPS}>
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
    </div>

    <div>
      <Text {...SECTION_HEADING_PROPS}>With badge</Text>
      <div className="flex" {...ROW_FLEX_PROPS}>
        <Avatar
          fallback={{ type: FALLBACK_TYPE.CHARACTER, value: 'A' }}
          badge={{ icon: Pencil }}
        />
      </div>
    </div>
  </div>
);
