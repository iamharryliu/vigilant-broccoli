import { Briefcase, FileText, FolderGit2, Linkedin, User } from 'lucide-react';
import {
  PROJECT_LINK,
  SOCIAL_LINK,
} from '@vigilant-broccoli/personal-common-js';
import { useTranslation } from '../i18n';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';
import { GithubIcon } from '../components/BrandIcons';
import { SectionHeading } from '../components/SectionHeading';
import { usePageTitle } from '../use-page-title';
import { PAGE_CLASS } from '../consts/layout';
import { CAREER_EXPERIENCE_ROUTE } from '../consts/routes';

const ICON_CLASS = 'h-5 w-5 shrink-0';
const RESUME_URL = 'https://harryliu.dev/resume';
const PERSONAL_WEBSITE_URL = 'https://harryliu.dev/';

export function CareerPage() {
  const { t } = useTranslation();
  usePageTitle(t('CAREER_PAGE.PAGE_TITLE'));

  return (
    <main className={PAGE_CLASS}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('CAREER_PAGE.TITLE')}
        </h1>
      </header>

      <section className="mb-8">
        <SectionHeading>{t('CAREER_PAGE.SECTION_PROFILE')}</SectionHeading>
        <CardGrid>
          <li>
            <CardLink
              href={RESUME_URL}
              title={t('CAREER_PAGE.RESUME.TITLE')}
              description={t('CAREER_PAGE.RESUME.DESCRIPTION')}
              icon={<FileText className={ICON_CLASS} />}
            />
          </li>
          <li>
            <CardLink
              route
              href={CAREER_EXPERIENCE_ROUTE}
              title={t('CAREER_PAGE.EXPERIENCE.TITLE')}
              description={t('CAREER_PAGE.EXPERIENCE.DESCRIPTION')}
              icon={<Briefcase className={ICON_CLASS} />}
            />
          </li>
        </CardGrid>
      </section>

      <section>
        <SectionHeading>{t('CAREER_PAGE.SECTION_LINKS')}</SectionHeading>
        <CardGrid>
          <li>
            <CardLink
              href={PROJECT_LINK.SOFTWARE_PROJECTS.URL}
              title={t('CAREER_PAGE.PROJECTS.TITLE')}
              description={t('CAREER_PAGE.PROJECTS.DESCRIPTION')}
              icon={<FolderGit2 className={ICON_CLASS} />}
            />
          </li>
          <li>
            <CardLink
              href={PERSONAL_WEBSITE_URL}
              title={t('CAREER_PAGE.PERSONAL_WEBSITE.TITLE')}
              description={t('CAREER_PAGE.PERSONAL_WEBSITE.DESCRIPTION')}
              icon={<User className={ICON_CLASS} />}
            />
          </li>
          <li>
            <CardLink
              href={SOCIAL_LINK.GITHUB.URL}
              title={t('CAREER_PAGE.GITHUB.TITLE')}
              description={t('CAREER_PAGE.GITHUB.DESCRIPTION')}
              icon={<GithubIcon />}
            />
          </li>
          <li>
            <CardLink
              href={SOCIAL_LINK.LINKEDIN.URL}
              title={t('CAREER_PAGE.LINKEDIN.TITLE')}
              description={t('CAREER_PAGE.LINKEDIN.DESCRIPTION')}
              icon={<Linkedin className={ICON_CLASS} />}
            />
          </li>
        </CardGrid>
      </section>
    </main>
  );
}
