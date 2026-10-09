import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';
import { useState } from 'react';

import {
  AvatarUploadConfig,
  UserAvatar,
  USER_AVATAR_VARIANT,
} from '@vigilant-broccoli/react-lib';

const SAMPLE_IMAGE = 'https://i.pravatar.cc/200?img=12';
const SAMPLE_NAME = 'Harry Liu';
const BLOB_URL_PREFIX = 'blob:';
const UPLOAD_LABEL = 'Update profile picture';
const UPLOAD_FILE_NAME = 'avatar.webp';

const NAMES = ['Alice', 'Bob', 'Carol'];
const INITIALS_NAMES = ['Alice Anderson', 'Alice'];

type UrlState = string | undefined;
type UrlSetter = (url: UrlState) => void;

function revokeIfBlob(url: UrlState) {
  if (url?.startsWith(BLOB_URL_PREFIX)) URL.revokeObjectURL(url);
}

function makeUploadConfig(
  current: UrlState,
  setter: UrlSetter,
): AvatarUploadConfig {
  return {
    label: UPLOAD_LABEL,
    hasImage: Boolean(current),
    fileName: UPLOAD_FILE_NAME,
    onUpload: async (blob: Blob) => {
      revokeIfBlob(current);
      setter(URL.createObjectURL(blob));
    },
    onRemove: async () => {
      revokeIfBlob(current);
      setter(undefined);
    },
  };
}

export const UserAvatarDemo = () => {
  const { t } = useTranslation();
  const [emptyUrl, setEmptyUrl] = useState<UrlState>();
  const [preloadedUrl, setPreloadedUrl] = useState<UrlState>(SAMPLE_IMAGE);

  return (
    <div className="flex flex-col gap-6">
      <DemoSection
        title={t('DEMO_SECTION.USER_AVATAR.BORING_AVATAR_FALLBACK_DEFAULT')}
      >
        <div className="flex flex-wrap items-center gap-4">
          {NAMES.map(name => (
            <UserAvatar key={name} name={name} />
          ))}
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.USER_AVATAR.INITIALS_FALLBACK')}>
        <div className="flex flex-wrap items-center gap-4">
          {INITIALS_NAMES.map(name => (
            <UserAvatar
              key={name}
              name={name}
              variant={USER_AVATAR_VARIANT.INITIALS}
            />
          ))}
        </div>
      </DemoSection>

      <DemoSection
        title={t('DEMO_SECTION.USER_AVATAR.WITH_UPLOAD_CLICK_AVATAR')}
      >
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar
            name={SAMPLE_NAME}
            avatarUrl={emptyUrl}
            upload={makeUploadConfig(emptyUrl, setEmptyUrl)}
          />
          <UserAvatar
            name={SAMPLE_NAME}
            avatarUrl={preloadedUrl}
            upload={makeUploadConfig(preloadedUrl, setPreloadedUrl)}
          />
        </div>
      </DemoSection>
    </div>
  );
};
