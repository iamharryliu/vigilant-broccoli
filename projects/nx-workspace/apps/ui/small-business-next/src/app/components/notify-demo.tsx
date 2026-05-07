'use client';

import { useEffect, useState } from 'react';
import type { Service, Subscription } from '../types/subscription.types';

interface Props {
  services: Service[];
  subscriptions: Subscription[];
}

type NotifyStatus = 'idle' | 'sending' | 'success' | 'error';

export const NotifyDemo = ({ services, subscriptions }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(prev =>
      prev && services.some(s => s.id === prev)
        ? prev
        : (services[0]?.id ?? null),
    );
  }, [services]);
  const [status, setStatus] = useState<NotifyStatus>('idle');
  const [result, setResult] = useState<{
    sent: number;
    failed: string[];
  } | null>(null);

  const selectedService = services.find(s => s.id === selectedId);
  const targets = subscriptions.filter(s => s.serviceId === selectedId);

  const handleNotify = async () => {
    if (!selectedService || targets.length === 0) return;
    setStatus('sending');
    setResult(null);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService.name,
          emails: targets.map(s => s.email),
        }),
      });
      const data = await res.json();
      setResult(data);
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-4">Notify</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedId === s.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500 mb-3">
        {targets.length} subscriber{targets.length !== 1 ? 's' : ''} for{' '}
        <span className="font-medium text-gray-700">
          {selectedService?.name}
        </span>
      </p>
      <button
        onClick={handleNotify}
        disabled={targets.length === 0 || status === 'sending'}
        className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'sending' ? 'Sending…' : 'Send Notification'}
      </button>
      {status === 'success' && result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
          ✓ Sent to {result.sent} subscriber{result.sent !== 1 ? 's' : ''}
          {result.failed.length > 0 && (
            <p className="mt-1 text-red-500">
              Failed: {result.failed.join(', ')}
            </p>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          Failed to send notifications.
        </div>
      )}
    </div>
  );
};
