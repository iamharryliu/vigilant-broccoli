'use client';

import { APP_TAB } from '../app.const';
import { CareerExperienceEditor } from '../components/career-editor.component';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.CAREER_EXPERIENCE);
  return <CareerExperienceEditor />;
}
