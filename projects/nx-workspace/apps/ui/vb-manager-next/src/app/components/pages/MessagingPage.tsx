'use client';

import { Card, Heading, Button, TextField, TextArea } from '@radix-ui/themes';
import { useState } from 'react';

const API_BASE_URL = '';

export const MessagingPage = () => {
  return (
    <div className="space-y-4">
      <EmailMessageForm />
      <TextMessageForm />
    </div>
  );
};

const EmailMessageForm = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('harryliu1995@gmail.com');
  const [subject, setSubject] = useState('Default subject');
  const [text, setText] = useState('Default text');
  const [html, setHtml] = useState('');
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
  };

  return (
    <Card>
      <Heading size="5" mb="4">
        Send Email Message
      </Heading>
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
    </Card>
  );
};

const TextMessageForm = () => {
  const [body, setBody] = useState('Test messsage.');
  const [from, setFrom] = useState('+14342312376');
  const [to, setTo] = useState('+16476082991');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setResult('');

    const response = await fetch(`${API_BASE_URL}/api/send-text-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body,
        from,
        to,
      }),
    });

    const data = await response.json();
    setResult(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  return (
    <Card>
      <Heading size="5" mb="4">
        Send Text Message
      </Heading>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">From</label>
            <TextField.Root
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">To</label>
            <TextField.Root
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Message Body</label>
          <TextArea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your message"
            rows={3}
          />
        </div>
        <Button onClick={handleSubmit} disabled={loading || !body || !from || !to}>
          {loading ? 'Sending...' : 'Send Text Message'}
        </Button>
        {result && (
          <div>
            <label className="block text-sm mb-1">Result</label>
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};
