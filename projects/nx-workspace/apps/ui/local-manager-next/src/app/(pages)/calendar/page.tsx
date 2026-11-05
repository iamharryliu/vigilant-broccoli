import { redirect } from 'next/navigation';
import { SIDEBAR_ROUTE } from '../../app.const';

export default function Page() {
  redirect(SIDEBAR_ROUTE.INDEX.path);
}
