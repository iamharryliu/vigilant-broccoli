'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CopyButton,
  DownloadButton,
  SearchInput,
  type DownloadAction,
} from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';
import { DEMO_SIGNATURE, renderTemplate, Signature } from './signatures.shared';
import { sanitizeSignatureHtml } from './sanitize-signature';
import { authFetch } from '../../../lib/api-helpers';

const LIST_ENDPOINT = '/api/signature/list';
const LOADING_TEXT = 'Loading...';

const FILTER_PLACEHOLDER = 'Filter employees...';
const NO_MATCH_TEXT = 'No employees match your filter';
const ACTION_DOWNLOAD_HTML = 'Download Employee Signature';
const ACTION_DOWNLOAD_ZIP = 'Download All Employee Signatures';
const DOWNLOAD_FILENAME = 'signature.html';
const MIME_TYPE_HTML = 'text/html';
const ZIP_FILENAME = 'signatures.zip';
const DOWNLOAD_ZIP_ENDPOINT = '/api/signature/downloadZippedSignatures';

const displayName = (sig: Signature) => {
  const name = [sig.firstName, sig.lastName].filter(Boolean).join(' ').trim();
  return name ? `${name} (${sig.email})` : sig.email;
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const SignaturePreviewer = ({
  activeTemplate,
}: {
  activeTemplate: string;
}) => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    authFetch(LIST_ENDPOINT)
      .then(res => res.json())
      .then((data: { signatures: Signature[] }) => {
        setSignatures(data.signatures ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const allSignatures = useMemo<Signature[]>(
    () => [DEMO_SIGNATURE, ...signatures],
    [signatures],
  );

  const filteredSignatures = useMemo<Signature[]>(() => {
    const needle = filterText.trim().toLowerCase();
    if (!needle) return allSignatures;
    return allSignatures.filter(sig =>
      displayName(sig).toLowerCase().includes(needle),
    );
  }, [allSignatures, filterText]);

  const downloadHtmlFor = (sig: Signature) => () => {
    const html = renderTemplate(activeTemplate, sig);
    triggerDownload(
      new Blob([html], { type: MIME_TYPE_HTML }),
      DOWNLOAD_FILENAME,
    );
  };

  const downloadZipped = async () => {
    const res = await authFetch(DOWNLOAD_ZIP_ENDPOINT);
    const blob = await res.blob();
    triggerDownload(blob, ZIP_FILENAME);
  };

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder={FILTER_PLACEHOLDER}
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
      />

      {loading ? (
        <Text size="2" color="gray">
          {LOADING_TEXT}
        </Text>
      ) : filteredSignatures.length === 0 ? (
        <Text size="2" color="gray">
          {NO_MATCH_TEXT}
        </Text>
      ) : (
        <div className="space-y-6">
          {filteredSignatures.map(sig => {
            const html = renderTemplate(activeTemplate, sig);
            const safeHtml = sanitizeSignatureHtml(html);
            const downloadActions: DownloadAction[] = [
              { label: ACTION_DOWNLOAD_HTML, onSelect: downloadHtmlFor(sig) },
              { label: ACTION_DOWNLOAD_ZIP, onSelect: downloadZipped },
            ];
            return (
              <div
                key={sig.email}
                className="flex items-start justify-between gap-2"
              >
                <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
                <div className="flex gap-1 shrink-0">
                  <CopyButton text={html} />
                  <DownloadButton actions={downloadActions} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
