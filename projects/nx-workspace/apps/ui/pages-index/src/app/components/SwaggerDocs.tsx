import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n';

const SWAGGER_UI_VERSION = '5.17.14';
const SWAGGER_UI_BASE = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}`;
const SWAGGER_UI_CSS = `${SWAGGER_UI_BASE}/swagger-ui.css`;
const SWAGGER_UI_BUNDLE = `${SWAGGER_UI_BASE}/swagger-ui-bundle.js`;
const CONTAINER_ID = 'swagger-ui';

type SwaggerUiBundle = (config: Record<string, unknown>) => void;

declare global {
  interface Window {
    SwaggerUIBundle?: SwaggerUiBundle;
  }
}

const loadStylesheet = (href: string) => {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (window.SwaggerUIBundle) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(src)));
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error(src)));
    document.head.appendChild(script);
  });

interface SwaggerDocsProps {
  specUrl: string;
}

export function SwaggerDocs({ specUrl }: SwaggerDocsProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    setReady(false);
    setError(null);
    loadStylesheet(SWAGGER_UI_CSS);

    loadScript(SWAGGER_UI_BUNDLE)
      .then(() => {
        if (cancelled || !window.SwaggerUIBundle) return;
        window.SwaggerUIBundle({
          url: specUrl,
          domNode: container,
          deepLinking: false,
          tryItOutEnabled: true,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(SWAGGER_UI_BUNDLE);
      });

    return () => {
      cancelled = true;
      if (container) container.innerHTML = '';
    };
  }, [specUrl]);

  return (
    <>
      {error && (
        <p className="px-4 sm:px-6 py-16 text-sm text-red-500">
          {t('API_SERVICE_DOCS_PAGE.ERROR', { message: error })}
        </p>
      )}
      {!error && !ready && (
        <p className="px-4 sm:px-6 py-16 text-sm text-gray-400">
          {t('README_PAGE.LOADING')}
        </p>
      )}
      <div id={CONTAINER_ID} ref={containerRef} />
    </>
  );
}
