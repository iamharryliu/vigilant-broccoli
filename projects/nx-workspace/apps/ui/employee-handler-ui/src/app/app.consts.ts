import { Users, CalendarDays, Mail, Settings } from 'lucide-react';
import { ROUTES } from '../lib/routes';

export const NAV_LINKS = [
  { labelKey: 'NAV.EMPLOYEES', href: ROUTES.EMPLOYEES, icon: Users },
  { labelKey: 'NAV.ABSENCES', href: ROUTES.ABSENCES, icon: CalendarDays },
  { labelKey: 'NAV.SIGNATURES', href: ROUTES.SIGNATURES, icon: Mail },
  { labelKey: 'NAV.SETTINGS', href: ROUTES.SETTINGS, icon: Settings },
] as const;
