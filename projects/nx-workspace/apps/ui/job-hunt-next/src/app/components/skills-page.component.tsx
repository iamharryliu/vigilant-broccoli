'use client';

import { useRouter } from 'next/navigation';
import { Network, UserRound } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@vigilant-broccoli/react-lib';
import { APP_TAB, SKILLS_GRAPH_PATH } from '../app.const';
import { useTranslation } from '../i18n';
import { MySkillsPage } from './my-skills-page.component';
import { SkillsGraphPage } from './skills-graph-page.component';

const SKILLS_VIEW = {
  MINE: 'mine',
  GRAPH: 'graph',
} as const;

type SkillsView = (typeof SKILLS_VIEW)[keyof typeof SKILLS_VIEW];

const VIEW_PATH: Record<SkillsView, string> = {
  [SKILLS_VIEW.MINE]: APP_TAB.SKILLS.path,
  [SKILLS_VIEW.GRAPH]: SKILLS_GRAPH_PATH,
};

export const SkillsPage = ({ view }: { view: SkillsView }) => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Tabs
        value={view}
        onValueChange={next => router.push(VIEW_PATH[next as SkillsView])}
        className="shrink-0"
      >
        <TabsList>
          <TabsTrigger value={SKILLS_VIEW.MINE} className="gap-1.5">
            <UserRound size={14} />
            {t('SKILLS.MINE')}
          </TabsTrigger>
          <TabsTrigger value={SKILLS_VIEW.GRAPH} className="gap-1.5">
            <Network size={14} />
            {t('SKILLS.GRAPH')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex min-h-0 flex-1 flex-col">
        {view === SKILLS_VIEW.MINE ? <MySkillsPage /> : <SkillsGraphPage />}
      </div>
    </div>
  );
};

export { SKILLS_VIEW };
