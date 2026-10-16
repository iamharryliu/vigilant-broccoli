// Reserved prefix: no real Slack member id starts with it, so a seeded row is recognisable without a schema flag.
export const DEMO_USER_ID_PREFIX = 'U_DEMO_';

export const isDemoUserId = (userId: string) =>
  userId.startsWith(DEMO_USER_ID_PREFIX);

export type DemoUser = {
  id: string;
  realName: string;
  title: string;
  color: string;
  homeOffice: string;
  isAdmin?: boolean;
};

export const DEMO_BOT_USER_ID = 'U00OKINBOT';
export const DEMO_BOT_NAME = 'OK-IN';

export const DEMO_OFFICES = ['Berlin', 'Stockholm', 'Paris', 'New York'];

export const DEMO_USERS: DemoUser[] = [
  {
    id: `${DEMO_USER_ID_PREFIX}ASTRID`,
    realName: 'Astrid Lindqvist',
    title: 'Engineering Manager',
    color: '#e8912d',
    homeOffice: 'Stockholm',
    isAdmin: true,
  },
  {
    id: `${DEMO_USER_ID_PREFIX}MATEO`,
    realName: 'Mateo Fernandez',
    title: 'Senior Backend Engineer',
    color: '#2eb67d',
    homeOffice: 'Berlin',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}PRIYA`,
    realName: 'Priya Raman',
    title: 'Product Designer',
    color: '#36c5f0',
    homeOffice: 'Stockholm',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}LUCAS`,
    realName: 'Lucas Moreau',
    title: 'Frontend Engineer',
    color: '#e01e5a',
    homeOffice: 'Paris',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}HANNA`,
    realName: 'Hanna Becker',
    title: 'Data Analyst',
    color: '#7c3085',
    homeOffice: 'Berlin',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}OLIVER`,
    realName: 'Oliver Grant',
    title: 'Account Executive',
    color: '#1264a3',
    homeOffice: 'New York',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}SOFIA`,
    realName: 'Sofia Rossi',
    title: 'People Operations',
    color: '#ecb22e',
    homeOffice: 'Paris',
    isAdmin: true,
  },
  {
    id: `${DEMO_USER_ID_PREFIX}NOAH`,
    realName: 'Noah Williams',
    title: 'DevOps Engineer',
    color: '#4a154b',
    homeOffice: 'New York',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}EBBA`,
    realName: 'Ebba Nilsson',
    title: 'QA Engineer',
    color: '#0b8a6e',
    homeOffice: 'Stockholm',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}KENJI`,
    realName: 'Kenji Tanaka',
    title: 'Staff Engineer',
    color: '#c2410c',
    homeOffice: 'Berlin',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}AMARA`,
    realName: 'Amara Okafor',
    title: 'Customer Success',
    color: '#9333ea',
    homeOffice: 'New York',
  },
  {
    id: `${DEMO_USER_ID_PREFIX}FELIX`,
    realName: 'Felix Dubois',
    title: 'Marketing Lead',
    color: '#0e7490',
    homeOffice: 'Paris',
  },
];
