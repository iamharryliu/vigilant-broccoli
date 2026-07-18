import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { SectionHeading } from '../components/SectionHeading';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';

export function UiPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        title={t('UI_PAGE.TITLE')}
        description={t('UI_PAGE.DESCRIPTION')}
      />

      <section className="mb-12">
        <SectionHeading>
          {t('UI_PAGE.SECTION_COMPONENT_LIBRARY')}
        </SectionHeading>
        <CardGrid>
          <li>
            <CardLink
              href="./react-component-library/"
              title={t('UI_PAGE.COMPONENT_LIBRARY.TITLE')}
              description={t('UI_PAGE.COMPONENT_LIBRARY.DESCRIPTION')}
            />
          </li>
        </CardGrid>
      </section>

      <section>
        <SectionHeading>{t('UI_PAGE.SECTION_APPS')}</SectionHeading>
        <CardGrid>
          <li>
            <CardLink
              href="https://harryliu.dev/"
              title={t('UI_PAGE.HARRY_LIU.TITLE')}
              description={t('UI_PAGE.HARRY_LIU.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://cloud8skate.com/"
              title={t('UI_PAGE.CLOUD_8_SKATE.TITLE')}
              description={t('UI_PAGE.CLOUD_8_SKATE.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://docs.harryliu.dev/"
              title={t('UI_PAGE.DOCS_MD.TITLE')}
              description={t('UI_PAGE.DOCS_MD.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://staging-employee-handler-ui.vercel.app"
              title={t('UI_PAGE.EMPLOYEE_HANDLER_UI.TITLE')}
              description={t('UI_PAGE.EMPLOYEE_HANDLER_UI.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://staging-findme.vercel.app/"
              title={t('UI_PAGE.FIND_ME.TITLE')}
              description={t('UI_PAGE.FIND_ME.DESCRIPTION')}
            />
          </li>
          <li>
            <CardLink
              href="https://staging-whiteboard.vercel.app/"
              title={t('UI_PAGE.WHITEBOARD.TITLE')}
              description={t('UI_PAGE.WHITEBOARD.DESCRIPTION')}
            />
          </li>
        </CardGrid>
      </section>
    </main>
  );
}
