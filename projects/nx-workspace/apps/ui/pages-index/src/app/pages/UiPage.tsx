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

      <section>
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
    </main>
  );
}
