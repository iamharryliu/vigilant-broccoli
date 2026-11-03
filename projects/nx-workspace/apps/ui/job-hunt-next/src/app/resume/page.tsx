'use client';

import { APP_TAB } from '../app.const';
import {
  MASTER_RESUME_SOURCE,
  ResumeTab,
} from '../components/resume-tab.component';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.RESUME);
  return <ResumeTab source={MASTER_RESUME_SOURCE} resettable />;
}
