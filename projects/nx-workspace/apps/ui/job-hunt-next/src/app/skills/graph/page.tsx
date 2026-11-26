'use client';

import { APP_TAB } from '../../app.const';
import {
  SKILLS_VIEW,
  SkillsPage,
} from '../../components/skills-page.component';
import { useTabTitle } from '../../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.SKILLS);
  return <SkillsPage view={SKILLS_VIEW.GRAPH} />;
}
