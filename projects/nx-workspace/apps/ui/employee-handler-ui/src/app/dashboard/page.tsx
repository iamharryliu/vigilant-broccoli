import { redirect } from 'next/navigation';
import { ROUTES } from '../../lib/routes';

export default function DashboardIndex() {
  redirect(ROUTES.EMPLOYEES);
}
