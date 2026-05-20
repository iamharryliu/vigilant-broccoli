import { FC } from 'react';
import {
  Avatar,
  AvatarSize,
  AvatarUploadConfig,
  FALLBACK_TYPE,
} from './Avatar';

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

const BORING_AVATAR_STYLE = 'beam' as const;
const MAX_INITIALS = 2;
const WHITESPACE_REGEX = /\s+/;

function initialsFromName(name: string): string {
  return name
    .trim()
    .split(WHITESPACE_REGEX)
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map(token => token[0]!.toUpperCase())
    .join('');
}

function resolveFallback(name: string | undefined, variant: UserAvatarVariant) {
  if (!name) return undefined;

  if (variant === USER_AVATAR_VARIANT.INITIALS) {
    return { type: FALLBACK_TYPE.CHARACTER, value: initialsFromName(name) };
  }

  return {
    type: FALLBACK_TYPE.BORING_AVATAR,
    name,
    variant: BORING_AVATAR_STYLE,
    colors: USER_AVATAR_COLORS,
  };
}

interface UserAvatarBaseProps {
  className?: string;
  size?: AvatarSize;
  upload?: AvatarUploadConfig;
  variant?: UserAvatarVariant;
}

type UserAvatarProps = UserAvatarBaseProps &
  ({ avatarUrl: string; name?: string } | { avatarUrl?: string; name: string });

export const UserAvatar: FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  className,
  size,
  upload,
  variant = USER_AVATAR_VARIANT.BORING,
}) => {
  const fallback = resolveFallback(name, variant);
  const sharedProps = { className, size, upload };

  if (fallback) {
    return (
      <Avatar avatarUrl={avatarUrl} fallback={fallback} {...sharedProps} />
    );
  }
  return <Avatar avatarUrl={avatarUrl!} {...sharedProps} />;
};
