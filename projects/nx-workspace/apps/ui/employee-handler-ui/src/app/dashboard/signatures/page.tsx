'use client';

import { useState } from 'react';
import { Button, CardContainer, Textarea } from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';
import { SignaturePreviewer } from './SignaturePreviewer';
import {
  ERR_NO_EMAILS,
  parseEmails,
  postEmails,
} from '../../../lib/api-helpers';

const UPDATE_ENDPOINT = '/api/signature/updateEmailSignatures';
const DOWNLOAD_ENDPOINT = '/api/signature/downloadZippedSignatures';
const EMAIL_ENDPOINT = '/api/signature/emailZippedSignatures';

const PAGE_HEADING = 'Signatures';
const SUCCESS_UPDATE = 'Email signatures updated';
const SUCCESS_DOWNLOAD = 'Signatures downloaded';
const SUCCESS_EMAIL = 'Signatures emailed';

const UPDATE_CARD_TITLE = 'Update email signatures';
const UPDATE_CARD_DESCRIPTION =
  'Regenerates and pushes email signatures for all active employees.';
const ACTION_UPDATE = 'Update Email Signatures';

const DOWNLOAD_CARD_TITLE = 'Download zipped signatures';
const DOWNLOAD_CARD_DESCRIPTION =
  'Downloads a zip of all current employee signatures.';
const ACTION_DOWNLOAD = 'Download Zipped Signatures';

const EMAIL_CARD_TITLE = 'Email zipped signatures';
const EMAIL_CARD_DESCRIPTION =
  'Send the signature zip to one or more email addresses. Comma-separated.';
const EMAIL_PLACEHOLDER = 'alice@example.com, bob@example.com';
const ACTION_EMAIL = 'Email Signatures';

const ZIP_FILENAME = 'signatures.zip';
const PAGE_CONTAINER = 'max-w-3xl mx-auto p-8 space-y-6';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default function SignaturesPage() {
  const [emailInput, setEmailInput] = useState('');

  const updateSignatures = async () => {
    await fetch(UPDATE_ENDPOINT);
    alert(SUCCESS_UPDATE);
  };

  const downloadZipped = async () => {
    const res = await fetch(DOWNLOAD_ENDPOINT);
    const blob = await res.blob();
    downloadBlob(blob, ZIP_FILENAME);
    alert(SUCCESS_DOWNLOAD);
  };

  const emailZipped = async () => {
    const emails = parseEmails(emailInput);
    if (emails.length === 0) {
      alert(ERR_NO_EMAILS);
      return;
    }
    await postEmails(EMAIL_ENDPOINT, emails);
    alert(SUCCESS_EMAIL);
    setEmailInput('');
  };

  return (
    <div className={PAGE_CONTAINER}>
      <Text size="6" weight="bold">
        {PAGE_HEADING}
      </Text>

      <SignaturePreviewer />

      <CardContainer title={UPDATE_CARD_TITLE}>
        <Text size="2" color="gray">
          {UPDATE_CARD_DESCRIPTION}
        </Text>
        <div>
          <Button onClick={updateSignatures}>{ACTION_UPDATE}</Button>
        </div>
      </CardContainer>

      <CardContainer title={DOWNLOAD_CARD_TITLE}>
        <Text size="2" color="gray">
          {DOWNLOAD_CARD_DESCRIPTION}
        </Text>
        <div>
          <Button variant="outline" onClick={downloadZipped}>
            {ACTION_DOWNLOAD}
          </Button>
        </div>
      </CardContainer>

      <CardContainer title={EMAIL_CARD_TITLE}>
        <Text size="2" color="gray">
          {EMAIL_CARD_DESCRIPTION}
        </Text>
        <Textarea
          placeholder={EMAIL_PLACEHOLDER}
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          rows={3}
        />
        <div>
          <Button onClick={emailZipped}>{ACTION_EMAIL}</Button>
        </div>
      </CardContainer>
    </div>
  );
}
