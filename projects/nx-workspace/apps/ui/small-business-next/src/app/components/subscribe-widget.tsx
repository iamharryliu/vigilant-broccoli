'use client';

import { useState } from 'react';
import type { Service, Subscription } from '../types/subscription.types';

interface Props {
  service: Service;
  onSubscribe: (sub: Subscription) => void;
}

export const SubscribeWidget = ({ service, onSubscribe }: Props) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSubscribe({ id: crypto.randomUUID(), serviceId: service.id, email });
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-1">{service.name}</h2>
      <p className="text-sm text-gray-500 mb-4">Subscribe for updates</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {submitted ? '✓' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
};
