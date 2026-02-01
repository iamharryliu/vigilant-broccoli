'use client';

import { Button, TextField, TextArea } from '@radix-ui/themes';
import { useState } from 'react';

const API_BASE_URL = '';

interface EmailMessageFormProps {
  defaultFrom?: string;
  defaultTo?: string;
  defaultSubject?: string;
  defaultText?: string;
  defaultHtml?: string;
  onSuccess?: () => void;
}

export const EmailMessageForm = ({
  defaultFrom = '',
  defaultTo = 'harryliu1995@gmail.com',
  defaultSubject = 'Default subject',
  defaultText = 'Default text',
  defaultHtml = '',
  onSuccess,
}: EmailMessageFormProps) => {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [text, setText] = useState(defaultText);
  const [html, setHtml] = useState(defaultHtml);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setResult('');
    setError('');

    const response = await fetch(`${API_BASE_URL}/api/send-email-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || undefined,
        to,
        subject,
        text: text || undefined,
        html: html || undefined,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      setError(text || `Error: ${response.status} ${response.statusText}`);
      setLoading(false);
      return;
    }

    const data = await response.json();
    setResult(JSON.stringify(data, null, 2));
    setLoading(false);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">From (optional)</label>
          <TextField.Root
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="sender@example.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">To</label>
          <TextField.Root
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Subject</label>
        <TextField.Root
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Text (optional)</label>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Plain text message"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">HTML (optional)</label>
        <TextArea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="<p>HTML message</p>"
          rows={3}
        />
      </div>
      <Button onClick={handleSubmit} disabled={loading || !to || !subject}>
        {loading ? 'Sending...' : 'Send Email'}
      </Button>
      {error && (
        <div>
          <label className="block text-sm mb-1 text-red-600 dark:text-red-400">
            Error
          </label>
          <pre className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded text-xs overflow-auto text-red-900 dark:text-red-100">
            {error}
          </pre>
        </div>
      )}
      {result && (
        <div>
          <label className="block text-sm mb-1 text-green-600 dark:text-green-400">
            Success
          </label>
          <pre className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-2 rounded text-xs overflow-auto text-green-900 dark:text-green-100">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};
