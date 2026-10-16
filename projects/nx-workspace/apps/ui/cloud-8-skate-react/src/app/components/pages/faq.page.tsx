import { useTranslation } from '../../i18n';
import { ROUTE_PATH } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { getFaqPage } from '../../core/services/sanity.service';
import { useAsyncData } from '../../core/services/use-async-data';
import { ContentContainer } from '../features/content-container';

export function FaqPage() {
  const { t } = useTranslation();
  const { data: faqPage, isLoading } = useAsyncData(getFaqPage);
  useSeo({
    title: faqPage?.seoTitle || t('SEO.FAQ.TITLE'),
    description: faqPage?.seoDescription || t('SEO.FAQ.DESCRIPTION'),
    path: ROUTE_PATH.FAQ,
    keywords: faqPage?.seoKeywords || t('SEO.FAQ.KEYWORDS'),
  });

  return (
    <ContentContainer>
      {faqPage ? (
        <section className="mb-8 reveal-up">
          <h1 className="text-3xl font-bold mb-4 lg:text-4xl reveal-up reveal-up-delay-1">
            {faqPage.title}
          </h1>
          {faqPage.intro && (
            <p className="text-base leading-7 text-gray-700 mb-8 reveal-up reveal-up-delay-2">
              {faqPage.intro}
            </p>
          )}
          <div className="space-y-6">
            {(faqPage.faqItems ?? []).map(item => (
              <article
                key={item._key ?? item.question}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm surface-card reveal-up"
              >
                <h2 className="text-xl font-semibold mb-2">{item.question}</h2>
                <p className="text-base leading-7 text-gray-700 whitespace-pre-line">
                  {item.answer}
                </p>
                {!!item.links?.length && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {item.links.map(link => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 interactive-chip"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : (
        !isLoading && (
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm reveal-up">
            <h1 className="text-3xl font-bold mb-4 lg:text-4xl">
              {t('FAQ.TITLE')}
            </h1>
            <p className="text-base leading-7 text-gray-700">
              {t('FAQ.UNAVAILABLE')}
            </p>
          </section>
        )
      )}
    </ContentContainer>
  );
}
