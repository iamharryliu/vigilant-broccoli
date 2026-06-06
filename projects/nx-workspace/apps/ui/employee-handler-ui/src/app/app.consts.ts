import { Users, Mail } from 'lucide-react';
import { ROUTES } from '../lib/routes';

export const APP_LABEL = 'Employee Handler';

export const NAV_LINKS = [
  { label: 'Employees', href: ROUTES.EMPLOYEES, icon: Users },
  { label: 'Signatures', href: ROUTES.SIGNATURES, icon: Mail },
];
