'use client';

import { useState, useEffect } from 'react';

interface BucketFile {
  name: string;
  size?: number;
  updatedAt?: string;
}

export default function BucketDemoPage() {
  const [files, setFiles] = useState<BucketFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bucket');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/bucket', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchFiles();
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await fetch(`/api/bucket?fileName=${encodeURIComponent(fileName)}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bucket?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFiles();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Local Bucket CRUD Demo</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <input
              type="file"
              name="files"
              multiple
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500">You can select multiple files at once</p>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Files</h2>
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {file.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.updatedAt ? new Date(file.updatedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDownload(file.name)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
