import {
  CardContainer,
  CopyButton,
  StatusCardList,
  StatusCardListItem,
  Text,
} from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  LOCAL_CREDENTIAL_SERVICE,
  LocalCredentialService,
} from '@vigilant-broccoli/vb-manager-local-common';
import { authFetch } from '../../libs/auth';

const TITLE = 'Local Credentials';

interface LocalCredential {
  service: LocalCredentialService;
  label: string;
  url: string;
  detail: string;
}

const LOCAL_CREDENTIALS: LocalCredential[] = [
  {
    service: LOCAL_CREDENTIAL_SERVICE.GRAFANA,
    label: 'Grafana',
    url: 'https://grafana.vigilant-broccoli.app',
    detail: 'Admin password (user: admin)',
  },
  {
    service: LOCAL_CREDENTIAL_SERVICE.HEADLAMP,
    label: 'Headlamp',
    url: 'https://headlamp.vigilant-broccoli.app',
    detail: 'Login token, valid 24h',
  },
];

const fetchCredential = async (
  service: LocalCredentialService,
): Promise<string> => {
  const response = await authFetch(
    `${API_ENDPOINTS.LOCAL_CREDENTIALS}?service=${service}`,
  );
  if (!response.ok) throw new Error(`Failed to read ${service} credential`);
  const { value } = await response.json();
  return value;
};

const toItem = (credential: LocalCredential): StatusCardListItem => ({
  id: credential.service,
  label: credential.label,
  actions: (
    <CopyButton
      text={() => fetchCredential(credential.service)}
      label={`Copy ${credential.label} credential`}
    />
  ),
  children: (
    <Text size="1" color="gray">
      {credential.detail} ·{' '}
      <a
        href={credential.url}
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        {new URL(credential.url).host}
      </a>
    </Text>
  ),
});

export const LocalCredentialsComponent = () => (
  <CardContainer title={TITLE}>
    <StatusCardList items={LOCAL_CREDENTIALS.map(toItem)} />
  </CardContainer>
);
