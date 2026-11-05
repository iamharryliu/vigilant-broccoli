'use client';

import { useState } from 'react';
import { APP_TAB } from '../app.const';
import { PageContainer } from '../components/page-container.component';
import {
  MASTER_RESUME_SOURCE,
  ResumeTab,
} from '../components/resume-tab.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.RESUME);
  const { t } = useTranslation();
  const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null);
  return (
    <PageContainer
      title={t(APP_TAB.RESUME.titleKey)}
      actions={<div ref={setToolbarSlot} />}
    >
      <ResumeTab
        source={MASTER_RESUME_SOURCE}
        resettable
        toolbarSlot={toolbarSlot}
      />
    </PageContainer>
  );
}
