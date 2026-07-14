'use client';

import { useState, useEffect } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../../libs/auth';

interface BucketFile {
  name: string;
  size?: number;
  updatedAt?: string;
}

type Provider = 'local' | 'cloudflare-r2' | 'gcs';

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'cloudflare-r2', label: 'Cloudflare R2' },
  { value: 'gcs', label: 'Google Cloud Storage' },
];

export function StorageDemo() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<BucketFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('local');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/bucket?provider=${provider}`);
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) fetchFiles();
  }, [provider, mounted]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('provider', provider);
    try {
      const response = await authFetch('/api/bucket', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        await fetchFiles();
        (e.target as HTMLFormElement).reset();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    const response = await authFetch(
      `/api/bucket?fileName=${encodeURIComponent(fileName)}&provider=${provider}`,
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return;
    const response = await authFetch(
      `/api/bucket?fileName=${encodeURIComponent(fileName)}&provider=${provider}`,
      { method: 'DELETE' },
    );
    if (response.ok) await fetchFiles();
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {PROVIDERS.map(p => (
          <Button
            key={p.value}
            variant={provider === p.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setProvider(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <form onSubmit={handleUpload} className="flex items-center gap-3">
        <input
          type="file"
          name="files"
          multiple
          required
          className="text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
        />
        <Button type="submit" size="sm" loading={uploading}>
          Upload
        </Button>
      </form>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Files
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFiles}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {files.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-6 text-center">
            No files uploaded yet
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Size
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Updated
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map(file => (
                <tr key={file.name}>
                  <td className="px-4 py-2 text-sm">{file.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {file.updatedAt
                      ? new Date(file.updatedAt).toLocaleString()
                      : '-'}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file.name)}
                    >
                      Download
                    </Button>
                    <Button
                      variant="destructive-ghost"
                      size="sm"
                      onClick={() => handleDelete(file.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
