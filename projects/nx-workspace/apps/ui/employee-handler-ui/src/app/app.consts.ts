import { UserPlus, UserMinus, Mail, RefreshCw } from 'lucide-react';
import { ROUTES } from '../lib/routes';

export const APP_LABEL = 'Employee Handler';

export const NAV_LINKS = [
  { label: 'Onboarding', href: ROUTES.ONBOARDING, icon: UserPlus },
  { label: 'Offboarding', href: ROUTES.OFFBOARDING, icon: UserMinus },
  { label: 'Signatures', href: ROUTES.SIGNATURES, icon: Mail },
  { label: 'Sync', href: ROUTES.SYNC, icon: RefreshCw },
];
