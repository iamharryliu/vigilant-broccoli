import { redirect } from 'next/navigation';
import { CALENDAR_TAB, CALENDAR_TAB_QUERY_PARAM } from '../app.const';

// Tasks moved into the calendar page; keeps old bookmarks working.
export default function TaskListPage() {
  redirect(`/?${CALENDAR_TAB_QUERY_PARAM}=${CALENDAR_TAB.TASKS}`);
}
