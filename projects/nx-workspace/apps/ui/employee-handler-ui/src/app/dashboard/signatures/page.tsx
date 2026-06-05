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

const SUCCESS_UPDATE = 'Email signatures updated';
const SUCCESS_DOWNLOAD = 'Signatures downloaded';
const SUCCESS_EMAIL = 'Signatures emailed';

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
        Signatures
      </Text>

      <SignaturePreviewer />

      <CardContainer title="Update email signatures">
        <Text size="2" color="gray">
          Regenerates and pushes email signatures for all active employees.
        </Text>
        <div>
          <Button onClick={updateSignatures}>Update Email Signatures</Button>
        </div>
      </CardContainer>

      <CardContainer title="Download zipped signatures">
        <Text size="2" color="gray">
          Downloads a zip of all current employee signatures.
        </Text>
        <div>
          <Button variant="outline" onClick={downloadZipped}>
            Download Zipped Signatures
          </Button>
        </div>
      </CardContainer>

      <CardContainer title="Email zipped signatures">
        <Text size="2" color="gray">
          Send the signature zip to one or more email addresses.
          Comma-separated.
        </Text>
        <Textarea
          placeholder="alice@example.com, bob@example.com"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          rows={3}
        />
        <div>
          <Button onClick={emailZipped}>Email Signatures</Button>
        </div>
      </CardContainer>
    </div>
  );
}
