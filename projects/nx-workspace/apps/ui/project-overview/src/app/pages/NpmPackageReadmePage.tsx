import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import {
  isKnownNpmPackage,
  toNpmPackageUrl,
  toPackageName,
  toRegistryUrl,
} from '../consts/npmPackages';

export function NpmPackageReadmePage() {
  const { t } = useTranslation();
  const { pkg: slug } = useParams<{ pkg: string }>();
  const isKnown = isKnownNpmPackage(slug);
  const knownSlug = isKnown ? slug : undefined;

  return (
    <ReadmePage
      title={
        knownSlug ? toPackageName(knownSlug) : t('NPM_PACKAGES_PAGE.TITLE')
      }
      source={
        knownSlug
          ? {
              url: toRegistryUrl(knownSlug),
              parseKind: PARSE_KIND.NPM_REGISTRY,
            }
          : null
      }
      externalHref={knownSlug ? toNpmPackageUrl(knownSlug) : undefined}
      externalLabel={t('README_PAGE.VIEW_ON_NPM')}
      notFoundMessage={t('README_PAGE.NOT_FOUND')}
    />
  );
}
