import { FC } from 'react';
import { Avatar, AvatarSize, AvatarUploadConfig } from './Avatar';

export const USER_AVATAR_COLORS = [
  '#92A1C6',
  '#146A7C',
  '#F0AB3D',
  '#C271B4',
  '#C20D90',
];

export const USER_AVATAR_VARIANT = {
  BORING: 'boring',
  INITIALS: 'initials',
} as const;

export type UserAvatarVariant =
  (typeof USER_AVATAR_VARIANT)[keyof typeof USER_AVATAR_VARIANT];

const FALLBACK_CHARACTER = '?';
const CHARACTER_FALLBACK_TYPE = 'character' as const;
const BORING_AVATAR_FALLBACK_TYPE = 'boringAvatar' as const;
const BORING_AVATAR_STYLE = 'beam' as const;
const MAX_INITIALS = 2;

function initialsFromName(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return FALLBACK_CHARACTER;
  return tokens
    .slice(0, MAX_INITIALS)
    .map(token => token[0]!.toUpperCase())
    .join('');
}

function resolveFallback(name: string | undefined, variant: UserAvatarVariant) {
  if (!name) return FALLBACK_CHARACTER;

  if (variant === USER_AVATAR_VARIANT.INITIALS) {
    return { type: CHARACTER_FALLBACK_TYPE, value: initialsFromName(name) };
  }

  return {
    type: BORING_AVATAR_FALLBACK_TYPE,
    name,
    variant: BORING_AVATAR_STYLE,
    colors: USER_AVATAR_COLORS,
  };
}

interface UserAvatarProps {
  avatarUrl?: string;
  name?: string;
  className?: string;
  size?: AvatarSize;
  upload?: AvatarUploadConfig;
  variant?: UserAvatarVariant;
}

export const UserAvatar: FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  className,
  size,
  upload,
  variant = USER_AVATAR_VARIANT.BORING,
}) => (
  <Avatar
    avatarUrl={avatarUrl}
    className={className}
    size={size}
    fallback={resolveFallback(name, variant)}
    upload={upload}
  />
);
