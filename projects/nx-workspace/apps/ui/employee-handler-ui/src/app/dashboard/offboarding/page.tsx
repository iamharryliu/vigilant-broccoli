'use client';

import { useState } from 'react';
import { Button, CardContainer, Textarea } from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';
import {
  ERR_NO_EMAILS,
  parseEmails,
  postEmails,
} from '../../../lib/api-helpers';

const OFFBOARD_ENDPOINT = '/api/offboard';
const MANUAL_OFFBOARD_ENDPOINT = '/api/offboard/manualOffboard';
const POST_RETENTION_ENDPOINT = '/api/postRetentionCleanup';

const SUCCESS_OFFBOARD = 'Offboarded inactive employees';
const SUCCESS_MANUAL = 'Manually offboarded employees';
const SUCCESS_RETENTION = 'Post-retention cleanup complete';

const PAGE_CONTAINER = 'max-w-3xl mx-auto p-8 space-y-6';

export default function OffboardingPage() {
  const [emailInput, setEmailInput] = useState('');

  const offboardInactive = async () => {
    await fetch(OFFBOARD_ENDPOINT);
    alert(SUCCESS_OFFBOARD);
  };

  const manualOffboard = async () => {
    const emails = parseEmails(emailInput);
    if (emails.length === 0) {
      alert(ERR_NO_EMAILS);
      return;
    }
    await postEmails(MANUAL_OFFBOARD_ENDPOINT, emails);
    alert(SUCCESS_MANUAL);
    setEmailInput('');
  };

  const postRetentionCleanup = async () => {
    await fetch(POST_RETENTION_ENDPOINT);
    alert(SUCCESS_RETENTION);
  };

  return (
    <div className={PAGE_CONTAINER}>
      <Text size="6" weight="bold">
        Offboarding
      </Text>

      <CardContainer title="Offboard inactive employees">
        <Text size="2" color="gray">
          Deactivates accounts for employees marked as inactive in the roster.
        </Text>
        <div>
          <Button onClick={offboardInactive}>
            Offboard Inactive Employees
          </Button>
        </div>
      </CardContainer>

      <CardContainer title="Manual offboard">
        <Text size="2" color="gray">
          Offboard specific employees by email. Comma-separated.
        </Text>
        <Textarea
          placeholder="alice@example.com, bob@example.com"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          rows={3}
        />
        <div>
          <Button onClick={manualOffboard}>Manually Offboard Employees</Button>
        </div>
      </CardContainer>

      <CardContainer title="Post-retention cleanup">
        <Text size="2" color="gray">
          Permanently removes data for offboarded employees past the retention
          window.
        </Text>
        <div>
          <Button variant="destructive" onClick={postRetentionCleanup}>
            Post-Retention Cleanup
          </Button>
        </div>
      </CardContainer>
    </div>
  );
}
