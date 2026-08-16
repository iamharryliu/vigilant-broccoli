import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { SectionHeading } from '../components/SectionHeading';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';

export function WebApplicationsPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader title={t('WEB_APPLICATIONS_PAGE.TITLE')} />

      <section className="mb-12">
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_APPS')}
        </SectionHeading>
        <CardGrid>
          <li>
            <CardLink
              href="https://harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.HARRY_LIU.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.HARRY_LIU.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://cloud8skate.com/"
              title={t('WEB_APPLICATIONS_PAGE.CLOUD_8_SKATE.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.CLOUD_8_SKATE.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://docs.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.DOCS_MD.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.DOCS_MD.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://staging-findme.vercel.app/"
              title={t('WEB_APPLICATIONS_PAGE.FIND_ME.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.FIND_ME.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://staging-whiteboard.vercel.app/"
              title={t('WEB_APPLICATIONS_PAGE.WHITEBOARD.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.WHITEBOARD.DESCRIPTION')}
            />
          </li>
        </CardGrid>
      </section>

      <section>
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_DEMO')}
        </SectionHeading>
        <CardGrid>
          <li>
            <CardLink
              href="https://staging-employee-handler-ui.vercel.app"
              title={t('WEB_APPLICATIONS_PAGE.EMPLOYEE_HANDLER.TITLE')}
              description={t(
                'WEB_APPLICATIONS_PAGE.EMPLOYEE_HANDLER.DESCRIPTION',
              )}
            />
          </li>
        </CardGrid>
      </section>
    </main>
  );
}
