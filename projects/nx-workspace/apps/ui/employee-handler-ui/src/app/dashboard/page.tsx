'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../ProtectedRoute';

export default function Index() {
  const [emailInput, setEmailInput] = useState('');

  const onboardEmployeesClickHandler = async () => {
    await fetch('/api/onboard');
    alert('success');
  };

  const updateEmailSignaturesClickHandler = async () => {
    await fetch('/api/signature/updateEmailSignatures');
    alert('success');
  };

  const getZippedSignaturesClickHandler = async () => {
    const res = await fetch('/api/signature/downloadZippedSignatures');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-files.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert('success');
  };

  const emailZippedSignatures = async () => {
    const emails = emailInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email);
    if (emails.length === 0) {
      alert('Please enter valid email addresses');
      return;
    }
    await fetch('/api/signature/emailZippedSignatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    });
    alert('success');
  };

  const sync = async () => {
    await fetch('/api/sync');
    alert('success');
  };

  const offboardEmployeesClickHandler = async () => {
    await fetch('/api/offboard');
    alert('success');
  };

  const manualOffboardClickHandler = async () => {
    const emails = emailInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email);
    if (emails.length === 0) {
      alert('Please enter valid email addresses');
      return;
    }

    await fetch('/api/offboard/manualOffboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    });
    alert('success');
    setEmailInput('');
  };

  const postRetentionCleanup = async () => {
    await fetch('/api/postRetentionCleanup');
    alert('success');
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <button onClick={onboardEmployeesClickHandler}>
        Onboard Incoming Employees
      </button>
      <br />
      <button onClick={getZippedSignaturesClickHandler}>
        Download Zipped Signatures
      </button>
      <br />
      <button onClick={emailZippedSignatures}>Email Signatures</button>
      <br />
      <button onClick={updateEmailSignaturesClickHandler}>
        Update Email Signatures
      </button>
      <br />
      <button onClick={sync}>Sync Data</button>
      <br />
      <button onClick={offboardEmployeesClickHandler}>
        Offboard Inactive Employees
      </button>
      <br />
      <input
        type="text"
        placeholder="Enter emails, separated by commas"
        value={emailInput}
        onChange={e => setEmailInput(e.target.value)}
      />
      <button onClick={manualOffboardClickHandler}>
        Manually Offboard Employees
      </button>
      <br />
      <button onClick={postRetentionCleanup}>Post Retention Cleanup</button>
    </ProtectedRoute>
  );
}
