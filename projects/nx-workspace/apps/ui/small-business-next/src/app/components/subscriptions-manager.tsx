'use client';

import { useState } from 'react';
import type { Service, Subscription } from '../types/subscription.types';

interface Props {
  services: Service[];
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  onUpdate: (updated: Subscription) => void;
}

export const SubscriptionsManager = ({
  services,
  subscriptions,
  onDelete,
  onUpdate,
}: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');

  const serviceName = (id: string) =>
    services.find(s => s.id === id)?.name ?? id;

  const startEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setEditEmail(sub.email);
  };

  const saveEdit = (sub: Subscription) => {
    onUpdate({ ...sub, email: editEmail });
    setEditingId(null);
  };

  return (
    <div className="border rounded-xl p-5 bg-card shadow-sm">
      <h2 className="font-semibold text-foreground mb-4">
        Manage Subscriptions
      </h2>
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="pb-2 pr-4">Service</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(sub => (
              <tr key={sub.id} className="border-b last:border-0">
                <td className="py-2 pr-4 text-foreground">
                  {serviceName(sub.serviceId)}
                </td>
                <td className="py-2 pr-4">
                  {editingId === sub.id ? (
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  ) : (
                    <span className="text-foreground">{sub.email}</span>
                  )}
                </td>
                <td className="py-2">
                  <div className="flex gap-2 justify-end">
                    {editingId === sub.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(sub)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(sub)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(sub.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
