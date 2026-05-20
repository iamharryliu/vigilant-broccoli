'use client';

import React, { FC, ReactNode } from 'react';
import BoringAvatar from 'boring-avatars';
import { Camera, LucideIcon } from 'lucide-react';
import { AvatarRoot, AvatarImage, AvatarFallback } from './AvatarPrimitive';
import {
  AvatarBadge,
  AvatarBadgeSize,
  AvatarBadgeVariant,
} from './AvatarBadge';
import { AvatarUploadHandler } from './AvatarUploadHandler';
import { cn } from '../utils/cn';

export type AvatarSize = 'xsmall' | 'small' | 'medium' | 'large';
export type BoringAvatarVariant =
  | 'beam'
  | 'bauhaus'
  | 'marble'
  | 'ring'
  | 'sunset'
  | 'pixel';

export const FALLBACK_TYPE = {
  CHARACTER: 'character',
  BORING_AVATAR: 'boringAvatar',
} as const;

const DEFAULT_SIZE: AvatarSize = 'medium';
const AVATAR_ALT = 'Avatar';
const BORING_AVATAR_SIZE = '100%';
const BADGE_ICON_SIZE = '1em';

interface CharacterFallbackConfig {
  type: typeof FALLBACK_TYPE.CHARACTER;
  value: string;
}

interface BoringAvatarFallbackConfig {
  type: typeof FALLBACK_TYPE.BORING_AVATAR;
  name: string;
  variant: BoringAvatarVariant;
  colors: string[];
}

type FallbackConfigObject =
  | CharacterFallbackConfig
  | BoringAvatarFallbackConfig;
type FallbackConfig = FallbackConfigObject | ReactNode;

export interface AvatarBadgeConfig {
  icon: LucideIcon;
  size?: AvatarBadgeSize;
  variant?: AvatarBadgeVariant;
}

export interface AvatarUploadConfig {
  label: string;
  hasImage: boolean;
  fileName: string;
  onUpload: (blob: Blob) => Promise<void>;
  onRemove?: () => Promise<void>;
  cropDialogTitle?: string;
  cropDialogDescription?: string;
}

interface AvatarBaseProps {
  className?: string;
  size?: AvatarSize;
  badge?: AvatarBadgeConfig;
  upload?: AvatarUploadConfig;
}

type AvatarProps = AvatarBaseProps &
  (
    | { avatarUrl: string; fallback?: FallbackConfig }
    | { avatarUrl?: string; fallback: FallbackConfig }
  );

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xsmall: 'h-6 w-6',
  small: 'h-8 w-8',
  medium: 'h-10 w-10',
  large: 'h-14 w-14',
};

const TEXT_SIZE_CLASSES: Record<AvatarSize, string> = {
  xsmall: 'text-xs',
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

const DEFAULT_BADGE_SIZE: Record<AvatarSize, AvatarBadgeSize> = {
  xsmall: 'small',
  small: 'small',
  medium: 'small',
  large: 'medium',
};

const resolveFallbackContent = (fallback?: FallbackConfig): ReactNode => {
  if (!fallback) return null;

  if (
    typeof fallback === 'object' &&
    !React.isValidElement(fallback) &&
    'type' in fallback
  ) {
    const config = fallback as FallbackConfigObject;

    if (config.type === FALLBACK_TYPE.CHARACTER) {
      return config.value;
    }

    if (config.type === FALLBACK_TYPE.BORING_AVATAR) {
      return (
        <BoringAvatar
          name={config.name}
          variant={config.variant}
          size={BORING_AVATAR_SIZE}
          colors={config.colors}
        />
      );
    }
  }

  return fallback as ReactNode;
};

function renderAvatarBadge(
  badge: AvatarBadgeConfig,
  avatarSize: AvatarSize = DEFAULT_SIZE,
) {
  const badgeSize = badge.size ?? DEFAULT_BADGE_SIZE[avatarSize];
  const Icon = badge.icon;
  return (
    <AvatarBadge size={badgeSize} variant={badge.variant}>
      <Icon size={BADGE_ICON_SIZE} />
    </AvatarBadge>
  );
}

export const Avatar: FC<AvatarProps> = ({
  avatarUrl,
  className,
  size,
  fallback,
  badge,
  upload,
}) => {
  const resolvedSize = size ?? DEFAULT_SIZE;
  const fallbackContent = resolveFallbackContent(fallback);
  const resolvedBadge = badge ?? (upload ? { icon: Camera } : undefined);

  const avatarEl = (
    <AvatarRoot
      key={avatarUrl}
      className={cn(SIZE_CLASSES[resolvedSize], className)}
    >
      {avatarUrl && (
        <AvatarImage
          className="block h-full w-full object-cover"
          src={avatarUrl}
          alt={AVATAR_ALT}
        />
      )}
      <AvatarFallback className={cn(TEXT_SIZE_CLASSES[resolvedSize])}>
        {fallbackContent}
      </AvatarFallback>
    </AvatarRoot>
  );

  if (upload) {
    return (
      <AvatarUploadHandler
        ariaLabel={upload.label}
        hasImage={upload.hasImage}
        fileName={upload.fileName}
        onUpload={upload.onUpload}
        onRemove={upload.onRemove}
        title={upload.cropDialogTitle}
        description={upload.cropDialogDescription}
        renderTrigger={({ isBusy, openActionDialog }) => (
          <button
            type="button"
            onClick={openActionDialog}
            disabled={isBusy}
            className="relative inline-flex cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:scale-[1.03] transition-transform"
            aria-label={upload.label}
          >
            {avatarEl}
            {isBusy && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 text-[10px] font-semibold">
                ...
              </span>
            )}
            {resolvedBadge && renderAvatarBadge(resolvedBadge, resolvedSize)}
          </button>
        )}
      />
    );
  }

  if (!resolvedBadge) return avatarEl;

  return (
    <div className="relative inline-flex">
      {avatarEl}
      {renderAvatarBadge(resolvedBadge, resolvedSize)}
    </div>
  );
};
