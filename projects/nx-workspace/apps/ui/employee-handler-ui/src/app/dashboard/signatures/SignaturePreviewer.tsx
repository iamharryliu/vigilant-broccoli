'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CopyButton,
  DownloadButton,
  Select,
  type DownloadAction,
} from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';
import {
  DEMO_SIGNATURE,
  renderTemplate,
  Signature,
  SignatureTemplate,
} from './signatures.shared';
import { sanitizeSignatureHtml } from './sanitize-signature';
import { authFetch } from '../../../lib/api-helpers';

const LIST_ENDPOINT = '/api/signature/list';
const LOADING_TEXT = 'Loading...';

const SELECT_TEMPLATE_PLACEHOLDER = 'Select signature...';
const ACTION_DOWNLOAD_HTML = 'Download Employee Signature';
const ACTION_DOWNLOAD_ZIP = 'Download All Employee Signatures';
const DOWNLOAD_FILENAME = 'signature.html';
const MIME_TYPE_HTML = 'text/html';
const ZIP_FILENAME = 'signatures.zip';
const DOWNLOAD_ZIP_ENDPOINT = '/api/signature/downloadZippedSignatures';

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

const SignaturePreview = ({
  sig,
  activeTemplate,
  downloadZipped,
}: {
  sig: Signature;
  activeTemplate: string;
  downloadZipped: () => Promise<void>;
}) => {
  const html = renderTemplate(activeTemplate, sig);
  const safeHtml = sanitizeSignatureHtml(html);
  const downloadActions: DownloadAction[] = [
    {
      label: ACTION_DOWNLOAD_HTML,
      onSelect: () => {
        triggerDownload(
          new Blob([html], { type: MIME_TYPE_HTML }),
          DOWNLOAD_FILENAME,
        );
      },
    },
    { label: ACTION_DOWNLOAD_ZIP, onSelect: downloadZipped },
  ];
  return (
    <div className="flex items-start justify-between gap-2">
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      <div className="flex gap-1 shrink-0">
        <CopyButton text={html} />
        <DownloadButton actions={downloadActions} />
      </div>
    </div>
  );
};

export const SignaturePreviewer = ({
  templates,
  selectedId,
}: {
  templates: SignatureTemplate[];
  selectedId: string;
}) => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<
    SignatureTemplate | undefined
  >();

  useEffect(() => {
    authFetch(LIST_ENDPOINT)
      .then(res => res.json())
      .then((data: { signatures: Signature[] }) => {
        setSignatures(data.signatures ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const active = templates.find(t => t.id === selectedId);
    setPreviewTemplate(active);
  }, [templates, selectedId]);

  const allSignatures = useMemo<Signature[]>(
    () => [DEMO_SIGNATURE, ...signatures],
    [signatures],
  );

  const downloadZipped = async () => {
    const res = await authFetch(DOWNLOAD_ZIP_ENDPOINT);
    const blob = await res.blob();
    triggerDownload(blob, ZIP_FILENAME);
  };

  return (
    <div className="space-y-4">
      <Select<SignatureTemplate>
        options={templates}
        selectedOption={previewTemplate}
        setValue={setPreviewTemplate}
        placeholder={SELECT_TEMPLATE_PLACEHOLDER}
        optionIdenfifier="id"
        optionDisplayKey="label"
        triggerClassName="w-full"
      />

      {previewTemplate && (
        <div className="space-y-6">
          {loading ? (
            <Text size="2" color="gray">
              {LOADING_TEXT}
            </Text>
          ) : (
            allSignatures.map(sig => (
              <SignaturePreview
                key={sig.email}
                sig={sig}
                activeTemplate={previewTemplate.template}
                downloadZipped={downloadZipped}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
