'use client';

import { APP_TAB } from '../app.const';
import { RunList } from '../components/run-list.component';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.RUNS);
  return <RunList />;
}
