'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { MySkillsPage } from './my-skills-page.component';
import { SkillsGlossaryPage } from './skills-glossary-page.component';
import { SkillsGraphPage } from './skills-graph-page.component';

const SKILLS_TAB = {
  MINE: 'mine',
  GRAPH: 'graph',
  GLOSSARY: 'glossary',
} as const;

const TAB_CONTENT_CLASS =
  'mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden';

export const SkillsPage = () => {
  const { t } = useTranslation();
  return (
    <Tabs
      defaultValue={SKILLS_TAB.MINE}
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      <TabsList className="shrink-0">
        <TabsTrigger value={SKILLS_TAB.MINE}>{t('SKILLS.MINE')}</TabsTrigger>
        <TabsTrigger value={SKILLS_TAB.GRAPH}>{t('SKILLS.GRAPH')}</TabsTrigger>
        <TabsTrigger value={SKILLS_TAB.GLOSSARY}>
          {t('SKILLS.GLOSSARY')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value={SKILLS_TAB.MINE} className={TAB_CONTENT_CLASS}>
        <MySkillsPage />
      </TabsContent>
      <TabsContent value={SKILLS_TAB.GRAPH} className={TAB_CONTENT_CLASS}>
        <SkillsGraphPage />
      </TabsContent>
      <TabsContent value={SKILLS_TAB.GLOSSARY} className={TAB_CONTENT_CLASS}>
        <SkillsGlossaryPage />
      </TabsContent>
    </Tabs>
  );
};
