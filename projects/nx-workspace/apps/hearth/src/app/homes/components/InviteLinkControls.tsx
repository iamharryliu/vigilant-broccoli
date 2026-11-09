'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Heading,
  Input,
  Select,
  Text,
} from '@vigilant-broccoli/react-lib';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  useAuthHeader,
  useJsonAuthHeaders,
} from '../../hooks/use-auth-headers';
import { useTranslation } from '../../i18n';
import {
  CreatedInviteLink,
  INVITE_LINK_DEFAULTS,
  INVITE_LINK_EXPIRY_DAY_OPTIONS,
  INVITE_LINK_LIMITS,
  INVITE_LINKS_ENDPOINT,
  InviteLink,
  InviteLinkOptions,
} from '../../../lib/invite-links';

const EXPIRY_VALUES = INVITE_LINK_EXPIRY_DAY_OPTIONS.map(String);

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
  const [expiresInDays, setExpiresInDays] = useState(
    String(INVITE_LINK_DEFAULTS.EXPIRES_IN_DAYS),
  );
  const [maxUses, setMaxUses] = useState(String(INVITE_LINK_DEFAULTS.MAX_USES));
  const [requiresApproval, setRequiresApproval] = useState(false);

  const maxUsesValue = Number(maxUses);
  const maxUsesValid =
    Number.isInteger(maxUsesValue) &&
    maxUsesValue >= 1 &&
    maxUsesValue <= INVITE_LINK_LIMITS.MAX_USES;
  const expiryLabels = Object.fromEntries(
    EXPIRY_VALUES.map(days => [
      days,
      t('INVITE_LINKS.EXPIRY_DAYS', { count: days }),
    ]),
  );

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
    const options: InviteLinkOptions = {
      expiresInDays: Number(expiresInDays),
      maxUses: maxUsesValue,
      requiresApproval,
    };
    const res = await fetch(INVITE_LINKS_ENDPOINT(homeId), {
      method: HTTP_METHOD.POST,
      headers: await jsonHeaders(),
      body: JSON.stringify(options),
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
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            {t('INVITE_LINKS.EXPIRES_LABEL')}
          </Text>
          <Select
            value={expiresInDays}
            onValueChange={setExpiresInDays}
            options={EXPIRY_VALUES}
            displayMapper={expiryLabels}
            aria-label={t('INVITE_LINKS.EXPIRES_LABEL')}
          />
        </div>
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            {t('INVITE_LINKS.MAX_USES_LABEL')}
          </Text>
          <Input
            type="number"
            min={1}
            max={INVITE_LINK_LIMITS.MAX_USES}
            value={maxUses}
            onChange={e => setMaxUses(e.target.value)}
            className="w-24"
            aria-label={t('INVITE_LINKS.MAX_USES_LABEL')}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={requiresApproval}
          onCheckedChange={checked => setRequiresApproval(checked === true)}
        />
        <Text size="2">{t('INVITE_LINKS.REQUIRE_APPROVAL')}</Text>
      </label>
      <Button
        onClick={handleCopy}
        disabled={creating || !maxUsesValid}
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
                {t(
                  link.requires_approval
                    ? 'INVITE_LINKS.USAGE_APPROVAL'
                    : 'INVITE_LINKS.USAGE',
                  {
                    used: link.use_count,
                    max: link.max_uses,
                    expires: formatExpiry(link.expires_at),
                  },
                )}
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
