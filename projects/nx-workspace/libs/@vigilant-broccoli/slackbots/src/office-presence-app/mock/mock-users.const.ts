export type MockUser = {
  id: string;
  realName: string;
  title: string;
  color: string;
  homeOffice: string;
  isAdmin?: boolean;
};

export const MOCK_BOT_USER_ID = 'U00OKINBOT';
export const MOCK_BOT_NAME = 'OK-IN';

export const MOCK_OFFICES = ['Berlin', 'Stockholm', 'Paris', 'New York'];

export const MOCK_USERS: MockUser[] = [
  {
    id: 'U01ASTRID',
    realName: 'Astrid Lindqvist',
    title: 'Engineering Manager',
    color: '#e8912d',
    homeOffice: 'Stockholm',
    isAdmin: true,
  },
  {
    id: 'U02MATEO',
    realName: 'Mateo Fernandez',
    title: 'Senior Backend Engineer',
    color: '#2eb67d',
    homeOffice: 'Berlin',
  },
  {
    id: 'U03PRIYA',
    realName: 'Priya Raman',
    title: 'Product Designer',
    color: '#36c5f0',
    homeOffice: 'Stockholm',
  },
  {
    id: 'U04LUCAS',
    realName: 'Lucas Moreau',
    title: 'Frontend Engineer',
    color: '#e01e5a',
    homeOffice: 'Paris',
  },
  {
    id: 'U05HANNA',
    realName: 'Hanna Becker',
    title: 'Data Analyst',
    color: '#7c3085',
    homeOffice: 'Berlin',
  },
  {
    id: 'U06OLIVER',
    realName: 'Oliver Grant',
    title: 'Account Executive',
    color: '#1264a3',
    homeOffice: 'New York',
  },
  {
    id: 'U07SOFIA',
    realName: 'Sofia Rossi',
    title: 'People Operations',
    color: '#ecb22e',
    homeOffice: 'Paris',
    isAdmin: true,
  },
  {
    id: 'U08NOAH',
    realName: 'Noah Williams',
    title: 'DevOps Engineer',
    color: '#4a154b',
    homeOffice: 'New York',
  },
  {
    id: 'U09EBBA',
    realName: 'Ebba Nilsson',
    title: 'QA Engineer',
    color: '#0b8a6e',
    homeOffice: 'Stockholm',
  },
  {
    id: 'U10KENJI',
    realName: 'Kenji Tanaka',
    title: 'Staff Engineer',
    color: '#c2410c',
    homeOffice: 'Berlin',
  },
  {
    id: 'U11AMARA',
    realName: 'Amara Okafor',
    title: 'Customer Success',
    color: '#9333ea',
    homeOffice: 'New York',
  },
  {
    id: 'U12FELIX',
    realName: 'Felix Dubois',
    title: 'Marketing Lead',
    color: '#0e7490',
    homeOffice: 'Paris',
  },
];
