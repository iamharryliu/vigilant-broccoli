'use client';

import { Card, Heading, Button, TextField, TextArea } from '@radix-ui/themes';
import { useState } from 'react';
import { EmailMessageForm } from '../EmailMessageForm';

const API_BASE_URL = '';

export const MessagingPage = () => {
  return (
    <div className="space-y-4">
      <Card>
        <Heading size="5" mb="4">
          Send Email Message
        </Heading>
        <EmailMessageForm />
      </Card>
      <TextMessageForm />
    </div>
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
