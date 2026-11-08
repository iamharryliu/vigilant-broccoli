'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Heading, Input, Text } from '@vigilant-broccoli/react-lib';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  useAuthHeader,
  useJsonAuthHeaders,
} from '../../hooks/use-auth-headers';
import { useTranslation } from '../../i18n';
import {
  CreatedInviteLink,
  INVITE_LINKS_ENDPOINT,
  InviteLink,
} from '../../../lib/invite-links';

const COPIED_VISIBLE_MS = 2000;
const TEXT_MIME_TYPE = 'text/plain';

const formatExpiry = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

// Safari drops the click's clipboard permission across an await, so the
// pending URL is handed to ClipboardItem as a promise inside the gesture.
const copyPendingText = (text: Promise<string>) =>
  typeof ClipboardItem === 'undefined'
    ? text.then(value => navigator.clipboard.writeText(value))
    : navigator.clipboard.write([
        new ClipboardItem({
          [TEXT_MIME_TYPE]: text.then(
            value => new Blob([value], { type: TEXT_MIME_TYPE }),
          ),
        }),
      ]);

type Props = { homeId: string };

export const InviteLinkControls = ({ homeId }: Props) => {
  const { t } = useTranslation();
  const authHeader = useAuthHeader();
  const jsonHeaders = useJsonAuthHeaders();
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);
  // Shown when the clipboard write fails: the raw URL is never retrievable again.
  const [uncopiedUrl, setUncopiedUrl] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    const res = await fetch(INVITE_LINKS_ENDPOINT(homeId), {
      headers: await authHeader(),
    });
    if (res.ok) setLinks(await res.json());
  }, [homeId, authHeader]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const createLink = async (): Promise<CreatedInviteLink> => {
    const res = await fetch(INVITE_LINKS_ENDPOINT(homeId), {
      method: HTTP_METHOD.POST,
      headers: await authHeader(),
    });
    if (!res.ok) throw new Error(t('INVITE_LINKS.CREATE_FAILED'));
    return res.json();
  };

  const handleCopy = async () => {
    setCreating(true);
    setCreateFailed(false);
    setUncopiedUrl(null);
    const created = createLink();
    const copy = copyPendingText(created.then(link => link.url));
    // Rejects whenever creation does; that failure is reported below.
    copy.catch(() => undefined);
    try {
      const link = await created;
      setLinks(prev => [link, ...prev]);
      try {
        await copy;
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_VISIBLE_MS);
      } catch {
        setUncopiedUrl(link.url);
      }
    } catch {
      setCreateFailed(true);
    }
    setCreating(false);
  };

  const handleRevoke = async (linkId: string) => {
    setRevokingId(linkId);
    const res = await fetch(INVITE_LINKS_ENDPOINT(homeId), {
      method: HTTP_METHOD.DELETE,
      headers: await jsonHeaders(),
      body: JSON.stringify({ linkId }),
    });
    if (res.ok) setLinks(prev => prev.filter(link => link.id !== linkId));
    setRevokingId(null);
  };

  return (
    <div className="space-y-3">
      <Heading>{t('INVITE_LINKS.TITLE')}</Heading>
      <Text size="2" color="gray" as="p">
        {t('INVITE_LINKS.DESCRIPTION')}
      </Text>
      <Button
        onClick={handleCopy}
        disabled={creating}
        className="cursor-pointer"
      >
        {creating
          ? t('INVITE_LINKS.CREATING')
          : copied
            ? t('INVITE_LINKS.COPIED')
            : t('INVITE_LINKS.COPY')}
      </Button>
      {createFailed && (
        <Text size="2" color="red" as="p">
          {t('INVITE_LINKS.CREATE_FAILED')}
        </Text>
      )}
      {uncopiedUrl && (
        <div className="space-y-1">
          <Text size="2" as="p">
            {t('INVITE_LINKS.COPY_FAILED')}
          </Text>
          <Input
            readOnly
            value={uncopiedUrl}
            onFocus={e => e.target.select()}
          />
        </div>
      )}
      {links.length === 0 ? (
        <Text size="2" color="gray" as="p">
          {t('INVITE_LINKS.NONE_ACTIVE')}
        </Text>
      ) : (
        <ul className="space-y-2">
          {links.map(link => (
            <li key={link.id} className="flex items-center gap-2">
              <Text size="2" className="flex-1">
                {t('INVITE_LINKS.USAGE', {
                  used: link.use_count,
                  max: link.max_uses,
                  expires: formatExpiry(link.expires_at),
                })}
              </Text>
              <Button
                variant="outline"
                onClick={() => handleRevoke(link.id)}
                disabled={revokingId === link.id}
                className="cursor-pointer"
              >
                {revokingId === link.id
                  ? t('INVITE_LINKS.REVOKING')
                  : t('INVITE_LINKS.REVOKE')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
