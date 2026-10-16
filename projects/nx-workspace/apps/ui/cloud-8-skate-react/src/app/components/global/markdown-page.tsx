import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import { useTranslation } from '../../i18n';

const renderer = new Renderer();
renderer.link = (href, title, text) => {
  const titleAttribute = title ? ` title="${title}"` : '';
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttribute}>${text}</a>`;
};

const markdownParser = new Marked({ breaks: true, renderer });

const SANITIZE_OPTIONS = { ADD_ATTR: ['target'] };

type Props = {
  filepath: string;
};

export function MarkdownPage({ filepath }: Props) {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const [html, setHtml] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    fetch(filepath)
      .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.text();
      })
      .then(text => markdownParser.parse(text))
      .then(parsed => {
        if (!cancelled) setHtml(DOMPurify.sanitize(parsed, SANITIZE_OPTIONS));
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [filepath]);

  useEffect(() => {
    if (html && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [html, hash]);

  if (hasError)
    return <p className="mb-8 text-gray-700">{t('MARKDOWN.LOAD_ERROR')}</p>;

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
