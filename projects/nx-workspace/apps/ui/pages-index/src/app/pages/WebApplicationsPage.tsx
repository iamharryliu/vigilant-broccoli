import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { SectionHeading } from '../components/SectionHeading';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';
import { PAGE_CLASS } from '../consts/layout';

export function WebApplicationsPage() {
  const { t } = useTranslation();

  return (
    <main className={PAGE_CLASS}>
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
              href="https://context.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.CONTEXT_MD.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.CONTEXT_MD.DESCRIPTION')}
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
              href="https://findme.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.FIND_ME.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.FIND_ME.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://whiteboard.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.WHITEBOARD.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.WHITEBOARD.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://weather.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.WEATHER.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.WEATHER.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://utilities.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.UTILITIES.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.UTILITIES.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://components.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.COMPONENT_LIBRARY.TITLE')}
              description={t(
                'WEB_APPLICATIONS_PAGE.COMPONENT_LIBRARY.DESCRIPTION',
              )}
            />
          </li>
          <li>
            <CardLink
              href="https://links.harryliu.dev/"
              title={t('WEB_APPLICATIONS_PAGE.LINKS.TITLE')}
              description={t('WEB_APPLICATIONS_PAGE.LINKS.DESCRIPTION')}
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
              href="https://demo-employee-handler-ui.vercel.app"
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
