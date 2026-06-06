'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  CardContainer,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EllipsisCTA,
  Select,
  Textarea,
  type EllipsisAction,
} from '@vigilant-broccoli/react-lib';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { Text } from '@radix-ui/themes';

const LIST_ENDPOINT = '/api/signature/list';
const UPDATE_ENDPOINT = '/api/signature/update';
const PREVIEW_TITLE = 'Signature previewer';
const FRAME_TITLE = 'Email signature preview';
const LOADING_TEXT = 'Loading...';
const DEMO_EMAIL = 'demo@example.com';

const VIEW_AS_LABEL = 'Preview as:';
const CUSTOM_PLACEHOLDER = 'Paste signature HTML here...';
const APPLY_LABEL = 'Apply';
const PRESETS_LABEL = 'Presets';
const EDIT_HTML_LABEL = 'Edit HTML';
const APPLY_PRESET_LABEL = 'Apply Preset';
const CANCEL_LABEL = 'Cancel';
const PRESET_MODAL_TITLE = 'Select a preset';
const ACTION_DOWNLOAD = 'Download HTML';
const ACTION_COPY = 'Copy HTML';
const DOWNLOAD_FILENAME = 'signature.html';

const FRAME_CLASS =
  'w-full min-h-[180px] bg-white border border-border rounded-md';

type Signature = {
  email: string;
  signatureString: string;
  firstName?: string;
  lastName?: string;
};

const COMPANY_NAME = 'Company Name';
const COMPANY_WEBSITE = 'https://www.company.com';

const DEMO_SIGNATURE: Signature = {
  email: DEMO_EMAIL,
  firstName: 'Demo',
  lastName: 'User',
  signatureString: '',
};

const sigName = (sig: Signature) =>
  [sig.firstName, sig.lastName].filter(Boolean).join(' ').trim() || sig.email;

const PLACEHOLDER_NAME = '{{name}}';
const PLACEHOLDER_EMAIL = '{{email}}';

type DefaultTemplate = {
  label: string;
  template: string;
};

const renderTemplate = (template: string, sig: Signature) =>
  template
    .replaceAll(PLACEHOLDER_NAME, sigName(sig))
    .replaceAll(PLACEHOLDER_EMAIL, sig.email);

const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    label: 'Minimal',
    template: `<div style="font-family: Arial, sans-serif; color: #333; font-size: 13px;">
  <strong>{{name}}</strong><br/>
  <a href="mailto:{{email}}" style="color: #0073e6; text-decoration: none;">{{email}}</a>
</div>`,
  },
  {
    label: 'Standard',
    template: `<div style="font-family: Arial, sans-serif; color: #333;">
  <p style="margin: 0; font-size: 16px;"><strong>{{name}}</strong></p>
  <p style="margin: 4px 0; font-size: 13px;">
    <a href="mailto:{{email}}" style="color: #0073e6; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 4px 0; font-size: 13px; color: #666;">${COMPANY_NAME} | <a href="${COMPANY_WEBSITE}" style="color: #0073e6; text-decoration: none;">${COMPANY_WEBSITE.replace(/^https?:\/\//, '')}</a></p>
</div>`,
  },
  {
    label: 'Bold',
    template: `<div style="font-family: Georgia, serif; color: #111; border-left: 3px solid #0073e6; padding-left: 10px;">
  <p style="margin: 0; font-size: 15px; font-weight: bold;">{{name}}</p>
  <p style="margin: 3px 0; font-size: 13px;">
    <a href="mailto:{{email}}" style="color: #0073e6; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 3px 0; font-size: 12px; color: #777;">${COMPANY_NAME}</p>
</div>`,
  },
];

const displayName = (sig: Signature) => {
  const name = [sig.firstName, sig.lastName].filter(Boolean).join(' ').trim();
  return name ? `${name} (${sig.email})` : sig.email;
};

const toSrcDoc = (html: string) =>
  `<!doctype html><html><body style="margin:16px;">${html}</body></html>`;

type Mode = 'presets' | 'custom';

export const SignaturePreviewer = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [selected, setSelected] = useState<Signature>(DEMO_SIGNATURE);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('presets');
  const [selectedPreset, setSelectedPreset] = useState<DefaultTemplate>(
    DEFAULT_TEMPLATES[1],
  );
  const [pendingPreset, setPendingPreset] = useState<DefaultTemplate>(
    DEFAULT_TEMPLATES[1],
  );
  const [customHtml, setCustomHtml] = useState('');
  const [appliedCustomHtml, setAppliedCustomHtml] = useState('');
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  useEffect(() => {
    fetch(LIST_ENDPOINT)
      .then(res => res.json())
      .then((data: { signatures: Signature[] }) => {
        const sigs = data.signatures ?? [];
        setSignatures(sigs);
        const first = sigs[0];
        if (first?.signatureString) {
          setSelected(first);
          setCustomHtml(first.signatureString);
          setAppliedCustomHtml(first.signatureString);
          setMode('custom');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo<Signature[]>(
    () => [DEMO_SIGNATURE, ...signatures],
    [signatures],
  );

  const onSelectEmployee = (sig: Signature) => {
    setSelected(sig);
    if (sig.signatureString) {
      setCustomHtml(sig.signatureString);
      setAppliedCustomHtml(sig.signatureString);
      setMode('custom');
    } else {
      setMode('presets');
    }
  };

  const pushSignature = (email: string, template: string) => {
    if (email === DEMO_EMAIL) return;
    fetch(UPDATE_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify({ email, template }),
    });
  };

  const openPresetModal = () => {
    setPendingPreset(selectedPreset);
    setPresetModalOpen(true);
  };

  const confirmPreset = () => {
    setSelectedPreset(pendingPreset);
    setCustomHtml(pendingPreset.template);
    setAppliedCustomHtml(pendingPreset.template);
    setMode('custom');
    setPresetModalOpen(false);
    pushSignature(selected.email, pendingPreset.template);
  };

  const openCustomModal = () => {
    if (!customHtml) setCustomHtml(selectedPreset.template);
    setAppliedCustomHtml(customHtml || selectedPreset.template);
    setCustomModalOpen(true);
  };

  const applyCustom = () => {
    setAppliedCustomHtml(customHtml);
    setMode('custom');
    setCustomModalOpen(false);
    pushSignature(selected.email, customHtml);
  };

  const downloadHtml = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = DOWNLOAD_FILENAME;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = () => navigator.clipboard.writeText(previewHtml);

  const previewActions: EllipsisAction[] = [
    { label: PRESETS_LABEL, onSelect: openPresetModal },
    { label: EDIT_HTML_LABEL, onSelect: openCustomModal },
  ];

  const exportActions: EllipsisAction[] = [
    { label: ACTION_COPY, onSelect: copyHtml },
    { label: ACTION_DOWNLOAD, onSelect: downloadHtml },
  ];

  const previewHtml = useMemo(() => {
    const template =
      mode === 'custom' ? appliedCustomHtml : selectedPreset.template;
    return renderTemplate(template, selected);
  }, [mode, selectedPreset, selected, appliedCustomHtml]);

  const modalPreviewHtml = useMemo(
    () => renderTemplate(pendingPreset.template, selected),
    [pendingPreset, selected],
  );

  return (
    <CardContainer title={PREVIEW_TITLE}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Text size="2" color="gray">
            {VIEW_AS_LABEL}
          </Text>
          {loading ? (
            <Text size="2" color="gray">
              {LOADING_TEXT}
            </Text>
          ) : (
            <Select<Signature>
              options={options}
              selectedOption={selected}
              setValue={onSelectEmployee}
              optionIdenfifier="email"
              renderItem={displayName}
            />
          )}
        </div>
        <EllipsisCTA actions={previewActions} />
      </div>

      <div className="relative">
        <iframe
          title={FRAME_TITLE}
          srcDoc={toSrcDoc(previewHtml)}
          className={FRAME_CLASS}
          sandbox=""
        />
        <div className="absolute top-2 right-2">
          <EllipsisCTA actions={exportActions} />
        </div>
      </div>

      <Dialog open={presetModalOpen} onOpenChange={setPresetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{PRESET_MODAL_TITLE}</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 flex-wrap">
            {DEFAULT_TEMPLATES.map(t => (
              <Button
                key={t.label}
                size="sm"
                variant={
                  pendingPreset.label === t.label ? 'default' : 'outline'
                }
                onClick={() => setPendingPreset(t)}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <iframe
            title={FRAME_TITLE}
            srcDoc={toSrcDoc(modalPreviewHtml)}
            className={FRAME_CLASS}
            sandbox=""
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPresetModalOpen(false)}>
              {CANCEL_LABEL}
            </Button>
            <Button onClick={confirmPreset}>{APPLY_PRESET_LABEL}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={customModalOpen} onOpenChange={setCustomModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{EDIT_HTML_LABEL}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={CUSTOM_PLACEHOLDER}
            value={customHtml}
            onChange={e => setCustomHtml(e.target.value)}
            rows={6}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomModalOpen(false)}>
              {CANCEL_LABEL}
            </Button>
            <Button onClick={applyCustom}>{APPLY_LABEL}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContainer>
  );
};
