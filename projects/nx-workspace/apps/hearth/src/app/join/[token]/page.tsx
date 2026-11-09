'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text } from '@vigilant-broccoli/react-lib';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useAuth } from '../../providers/auth-provider';
import { useHome } from '../../providers/home-provider';
import { useAuthHeader } from '../../hooks/use-auth-headers';
import { useTranslation } from '../../i18n';
import { ROUTES } from '../../../lib/routes';
import { PAGE_TITLES, usePageTitle } from '../../../lib/page-title';
import {
  INVITE_LINK_STATUS,
  InviteLinkPreview,
  InviteLinkStatus,
  JOIN_ENDPOINT,
} from '../../../lib/invite-links';

const UNAVAILABLE_MESSAGE_KEY = {
  [INVITE_LINK_STATUS.INVALID]: 'JOIN.INVALID',
  [INVITE_LINK_STATUS.REVOKED]: 'JOIN.REVOKED',
  [INVITE_LINK_STATUS.EXPIRED]: 'JOIN.EXPIRED',
  [INVITE_LINK_STATUS.EXHAUSTED]: 'JOIN.EXHAUSTED',
} as const;

const getUnavailableMessageKey = (status: InviteLinkStatus) =>
  UNAVAILABLE_MESSAGE_KEY[status as keyof typeof UNAVAILABLE_MESSAGE_KEY] ??
  UNAVAILABLE_MESSAGE_KEY[INVITE_LINK_STATUS.INVALID];

// Signed-out visitors never reach this page: AppLayout sends them to /login
// with this path as `next`. Joining only happens on the confirm click, never
// on load, because link previewers fetch shared URLs.
export default function JoinHomePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  usePageTitle(PAGE_TITLES.JOIN_HOME);
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuth();
  const userId = session?.user.id;
  const { refreshHomes, setSelectedHomeId } = useHome();
  const authHeader = useAuthHeader();
  const [preview, setPreview] = useState<InviteLinkPreview | null>(null);
  const [joining, setJoining] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const res = await fetch(JOIN_ENDPOINT(token), {
        headers: await authHeader(),
      });
      setPreview(
        res.ok ? await res.json() : { status: INVITE_LINK_STATUS.INVALID },
      );
    })();
  }, [token, userId, authHeader]);

  const openHome = async (homeId: number) => {
    await refreshHomes();
    setSelectedHomeId(homeId);
    router.push(ROUTES.HOME_DETAIL(homeId));
  };

  const handleJoin = async () => {
    setJoining(true);
    setFailed(false);
    const res = await fetch(JOIN_ENDPOINT(token), {
      method: HTTP_METHOD.POST,
      headers: await authHeader(),
    });
    const result: Partial<InviteLinkPreview> = await res
      .json()
      .catch(() => ({}));
    if (res.ok && result.status === INVITE_LINK_STATUS.REQUESTED) {
      setJoining(false);
      setPreview(prev => ({ ...prev, status: INVITE_LINK_STATUS.REQUESTED }));
      return;
    }
    if (res.ok && result.homeId) {
      await openHome(result.homeId);
      return;
    }
    setJoining(false);
    if (result.status && result.status in UNAVAILABLE_MESSAGE_KEY) {
      setPreview({ status: result.status });
    } else {
      setFailed(true);
    }
  };

  const renderBody = () => {
    if (!preview) return <Text color="gray">{t('JOIN.LOADING')}</Text>;

    if (
      preview.status === INVITE_LINK_STATUS.ALREADY_MEMBER &&
      preview.homeId
    ) {
      const homeId = preview.homeId;
      return (
        <>
          <Text as="p">
            {t('JOIN.ALREADY_MEMBER', { home: preview.homeName ?? '' })}
          </Text>
          <Button onClick={() => openHome(homeId)} className="cursor-pointer">
            {t('JOIN.OPEN_HOME')}
          </Button>
        </>
      );
    }

    if (preview.status === INVITE_LINK_STATUS.REQUESTED) {
      return (
        <Text as="p">
          {t('JOIN.REQUEST_SENT', { home: preview.homeName ?? '' })}
        </Text>
      );
    }

    if (preview.status === INVITE_LINK_STATUS.VALID) {
      const needsApproval = Boolean(preview.requiresApproval);
      return (
        <>
          <Text as="p">
            {t(needsApproval ? 'JOIN.REQUESTED_INVITED' : 'JOIN.INVITED', {
              inviter: preview.inviterName ?? '',
              home: preview.homeName ?? '',
            })}
          </Text>
          {failed && (
            <Text as="p" color="red">
              {t('JOIN.FAILED')}
            </Text>
          )}
          <Button
            onClick={handleJoin}
            disabled={joining}
            className="cursor-pointer"
          >
            {joining
              ? t(needsApproval ? 'JOIN.REQUESTING' : 'JOIN.JOINING')
              : t(needsApproval ? 'JOIN.REQUEST' : 'JOIN.CONFIRM')}
          </Button>
        </>
      );
    }

    return <Text as="p">{t(getUnavailableMessageKey(preview.status))}</Text>;
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <Heading>{t('JOIN.TITLE')}</Heading>
      {renderBody()}
    </div>
  );
}
