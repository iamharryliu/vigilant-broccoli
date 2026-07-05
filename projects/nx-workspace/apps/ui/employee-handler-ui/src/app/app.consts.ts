import { Users, Mail, Settings } from 'lucide-react';
import { ROUTES } from '../lib/routes';

export const NAV_LINKS = [
  { labelKey: 'NAV.EMPLOYEES', href: ROUTES.EMPLOYEES, icon: Users },
  { labelKey: 'NAV.SIGNATURES', href: ROUTES.SIGNATURES, icon: Mail },
  { labelKey: 'NAV.SETTINGS', href: ROUTES.SETTINGS, icon: Settings },
] as const;
