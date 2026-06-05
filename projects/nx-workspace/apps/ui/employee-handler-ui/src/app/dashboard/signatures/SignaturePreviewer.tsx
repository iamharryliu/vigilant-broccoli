'use client';

import { useEffect, useMemo, useState } from 'react';
import { CardContainer, Select } from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';

const LIST_ENDPOINT = '/api/signature/list';
const PREVIEW_TITLE = 'Signature previewer';
const PREVIEW_LABEL = 'Employee';
const FRAME_TITLE = 'Email signature preview';
const LOADING_TEXT = 'Loading employees...';
const EMPTY_TEXT = 'No employees found';
const DEMO_EMAIL = 'demo@example.com';

const FRAME_CLASS =
  'w-full min-h-[180px] bg-white border border-border rounded-md';

type Signature = {
  email: string;
  signatureString: string;
  firstName?: string;
  lastName?: string;
};

const DEMO_SIGNATURE: Signature = {
  email: DEMO_EMAIL,
  firstName: 'Demo',
  lastName: 'User',
  signatureString: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p style="margin: 0; font-size: 14px;"><strong>Best regards,</strong></p>
      <p style="margin: 4px 0; font-size: 16px;"><strong>Demo User</strong></p>
      <p style="margin: 4px 0; font-size: 14px;">
        <a href="mailto:${DEMO_EMAIL}" style="color: #0073e6; text-decoration: none;">${DEMO_EMAIL}</a>
      </p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">Company Name | <a href="https://www.company.com" style="color: #0073e6; text-decoration: none;">www.company.com</a></p>
    </div>
  `.trim(),
};

const displayName = (sig: Signature) => {
  const name = [sig.firstName, sig.lastName].filter(Boolean).join(' ').trim();
  return name ? `${name} (${sig.email})` : sig.email;
};

export const SignaturePreviewer = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [selected, setSelected] = useState<Signature>(DEMO_SIGNATURE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(LIST_ENDPOINT)
      .then(res => res.json())
      .then((data: { signatures: Signature[] }) => {
        setSignatures(data.signatures ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo<Signature[]>(
    () => [DEMO_SIGNATURE, ...signatures],
    [signatures],
  );

  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><body style="margin:16px;">${selected.signatureString}</body></html>`,
    [selected],
  );

  return (
    <CardContainer title={PREVIEW_TITLE}>
      <div className="space-y-2">
        <Text size="2" color="gray" as="div">
          {PREVIEW_LABEL}
        </Text>
        {loading ? (
          <Text size="2" color="gray">
            {LOADING_TEXT}
          </Text>
        ) : options.length === 0 ? (
          <Text size="2" color="gray">
            {EMPTY_TEXT}
          </Text>
        ) : (
          <Select<Signature>
            options={options}
            selectedOption={selected}
            setValue={setSelected}
            optionIdenfifier="email"
            renderItem={displayName}
          />
        )}
      </div>
      <iframe
        title={FRAME_TITLE}
        srcDoc={srcDoc}
        className={FRAME_CLASS}
        sandbox=""
      />
    </CardContainer>
  );
};
