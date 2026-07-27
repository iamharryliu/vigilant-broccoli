import { FC } from 'react';
import {
  Avatar,
  AvatarSize,
  AvatarUploadConfig,
  FALLBACK_TYPE,
} from './Avatar';

export const TEAM_AVATAR_COLORS = [
  '#ffffea',
  '#a795a5',
  '#7a959e',
  '#424e5e',
  '#3b2b46',
];

const BORING_AVATAR_STYLE = 'bauhaus' as const;
const EMPTY_FALLBACK = '?';

interface TeamAvatarProps {
  avatarUrl?: string;
  name?: string;
  className?: string;
  size?: AvatarSize;
  upload?: AvatarUploadConfig;
}

export const TeamAvatar: FC<TeamAvatarProps> = ({
  avatarUrl,
  name,
  className,
  size,
  upload,
}) => {
  const fallback = name
    ? {
        type: FALLBACK_TYPE.BORING_AVATAR,
        name,
        variant: BORING_AVATAR_STYLE,
        colors: TEAM_AVATAR_COLORS,
      }
    : { type: FALLBACK_TYPE.CHARACTER, value: EMPTY_FALLBACK };

  return (
    <Avatar
      avatarUrl={avatarUrl}
      fallback={fallback}
      className={className}
      size={size}
      upload={upload}
    />
  );
};
