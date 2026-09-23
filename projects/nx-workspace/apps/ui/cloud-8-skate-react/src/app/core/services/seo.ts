import { useEffect } from 'react';
import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../../i18n';
import { LOGO_PATH, SITE_URL } from '../consts/routes.const';

interface SeoConfig {
  title: string;
  description: string;
  path?: string;
  keywords?: string;
}

const DEFAULT_IMAGE = `${SITE_URL}${LOGO_PATH}`;

const setMetaTag = (
  attr: 'name' | 'property',
  key: string,
  content: string,
) => {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export const useSeo = ({ title, description, path, keywords }: SeoConfig) => {
  const { t } = useTranslation();
  const fullTitle = `${title} | ${t('APP.NAME')}`;
  useDocumentTitle(fullTitle);

  useEffect(() => {
    const url = path ? `${SITE_URL}${path}` : SITE_URL;

    setMetaTag('name', 'description', description);
    if (keywords !== undefined) setMetaTag('name', 'keywords', keywords);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', DEFAULT_IMAGE);
    setMetaTag('property', 'og:url', url);
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', DEFAULT_IMAGE);
    document.head
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', url);
  }, [fullTitle, description, path, keywords]);
};
