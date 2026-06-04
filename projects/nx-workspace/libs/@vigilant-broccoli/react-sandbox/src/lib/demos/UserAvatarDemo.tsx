import { useState } from 'react';
import { Text } from '@radix-ui/themes';
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

const SECTION_HEADING_PROPS = {
  as: 'p',
  size: '2',
  weight: 'bold',
  mb: '2',
} as const;
const ROW_FLEX_PROPS = { align: 'center', gap: '4' } as const;
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
  const [emptyUrl, setEmptyUrl] = useState<UrlState>();
  const [preloadedUrl, setPreloadedUrl] = useState<UrlState>(SAMPLE_IMAGE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text {...SECTION_HEADING_PROPS}>Boring avatar fallback (default)</Text>
        <div className="flex" {...ROW_FLEX_PROPS}>
          {NAMES.map(name => (
            <UserAvatar key={name} name={name} />
          ))}
        </div>
      </div>

      <div>
        <Text {...SECTION_HEADING_PROPS}>Initials fallback</Text>
        <div className="flex" {...ROW_FLEX_PROPS}>
          {INITIALS_NAMES.map(name => (
            <UserAvatar
              key={name}
              name={name}
              variant={USER_AVATAR_VARIANT.INITIALS}
            />
          ))}
        </div>
      </div>

      <div>
        <Text {...SECTION_HEADING_PROPS}>With upload (click avatar)</Text>
        <div className="flex" {...ROW_FLEX_PROPS}>
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
      </div>
    </div>
  );
};
