'use client';

import { useState } from 'react';
import type { Service } from '../types/subscription.types';

interface Props {
  services: Service[];
  onCreate: (service: Service) => void;
  onUpdate: (service: Service) => void;
  onDelete: (id: string) => void;
}

export const ServicesManager = ({
  services,
  onCreate,
  onUpdate,
  onDelete,
}: Props) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate({ id: crypto.randomUUID(), name: newName.trim() });
    setNewName('');
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditName(service.name);
  };

  const saveEdit = (service: Service) => {
    if (editName.trim()) onUpdate({ ...service, name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-4">Manage Services</h2>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New service name"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </form>
      {services.length === 0 ? (
        <p className="text-sm text-gray-400">No services yet.</p>
      ) : (
        <ul className="space-y-2">
          {services.map(service => (
            <li
              key={service.id}
              className="flex items-center gap-2 border-b pb-2 last:border-0"
            >
              {editingId === service.id ? (
                <>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => saveEdit(service)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-400 hover:underline"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-700">
                    {service.name}
                  </span>
                  <button
                    onClick={() => startEdit(service)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(service.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
