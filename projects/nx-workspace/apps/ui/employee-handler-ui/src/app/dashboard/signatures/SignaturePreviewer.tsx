'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CopyButton,
  DownloadButton,
  Select,
  toast,
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
import { authFetchOk } from '../../../lib/api-helpers';
import { useAction } from '../../../lib/use-action';
import { useTranslation } from '../../i18n';

const LIST_ENDPOINT = '/api/signature/list';

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
  const { t } = useTranslation();
  const html = renderTemplate(activeTemplate, sig);
  const safeHtml = sanitizeSignatureHtml(html);
  const downloadActions: DownloadAction[] = [
    {
      label: t('SIGNATURES.PREVIEWER.DOWNLOAD_HTML'),
      onSelect: () => {
        triggerDownload(
          new Blob([html], { type: MIME_TYPE_HTML }),
          DOWNLOAD_FILENAME,
        );
      },
    },
    { label: t('SIGNATURES.PREVIEWER.DOWNLOAD_ZIP'), onSelect: downloadZipped },
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
  const { t } = useTranslation();
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<
    SignatureTemplate | undefined
  >();
  const { run } = useAction();

  useEffect(() => {
    authFetchOk(LIST_ENDPOINT)
      .then(res => res.json())
      .then((data: { signatures: Signature[] }) => {
        setSignatures(data.signatures ?? []);
      })
      .catch(() => toast.error(t('SIGNATURES.ERROR.LOAD_FAILED')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const active = templates.find(item => item.id === selectedId);
    setPreviewTemplate(active);
  }, [templates, selectedId]);

  const allSignatures = useMemo<Signature[]>(
    () => [DEMO_SIGNATURE, ...signatures],
    [signatures],
  );

  const downloadZipped = () =>
    run(
      async () => {
        const res = await authFetchOk(DOWNLOAD_ZIP_ENDPOINT);
        const blob = await res.blob();
        triggerDownload(blob, ZIP_FILENAME);
      },
      { success: t('SIGNATURES.SUCCESS.DOWNLOAD_ZIP') },
    );

  return (
    <div className="space-y-4">
      <Select<SignatureTemplate>
        options={templates}
        selectedOption={previewTemplate}
        setValue={setPreviewTemplate}
        placeholder={t('SIGNATURES.PREVIEWER.SELECT_PLACEHOLDER')}
        optionIdenfifier="id"
        optionDisplayKey="label"
        triggerClassName="w-full"
      />

      {previewTemplate && (
        <div className="space-y-6">
          {loading ? (
            <Text size="2" color="gray">
              {t('COMMON.LOADING')}
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
