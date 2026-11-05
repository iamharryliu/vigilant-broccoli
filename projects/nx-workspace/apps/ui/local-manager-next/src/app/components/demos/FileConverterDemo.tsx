'use client';

import { useState } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../../libs/auth';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import {
  FILE_CONVERSION_CATEGORIES,
  FILE_CONVERSION_FIELD,
  findFileConversionCategory,
  getFileExtension,
} from '../../constants/file-conversion';

const ACCEPTED_EXTENSIONS = FILE_CONVERSION_CATEGORIES.flatMap(category =>
  category.inputs.map(extension => `.${extension}`),
).join(',');

const FILENAME_REGEX = /filename="([^"]+)"/;

const getTargets = (fileName: string) =>
  findFileConversionCategory(fileName)?.outputs.filter(
    output => output !== getFileExtension(fileName),
  ) ?? [];

export function FileConverterDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState('');
  const [result, setResult] = useState<{ url: string; name: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = file ? findFileConversionCategory(file.name) : undefined;
  const targets = file ? getTargets(file.name) : [];

  const handleFileChange = (selected: File | null) => {
    setFile(selected);
    setResult(null);
    setError(null);
    setTarget(selected ? (getTargets(selected.name)[0] ?? '') : '');
    if (selected && !findFileConversionCategory(selected.name)) {
      setError(`Unsupported file type: ${selected.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !target) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append(FILE_CONVERSION_FIELD.FILE, file);
      formData.append(FILE_CONVERSION_FIELD.TARGET, target);
      const res = await authFetch(API_ENDPOINTS.FILE_CONVERT, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Conversion failed');
      }
      const encodedName = res.headers
        .get('Content-Disposition')
        ?.match(FILENAME_REGEX)?.[1];
      setResult({
        url: URL.createObjectURL(await res.blob()),
        name: encodedName
          ? decodeURIComponent(encodedName)
          : `converted.${target}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
          className="flex-1 text-sm"
        />
        <select
          value={target}
          onChange={e => setTarget(e.target.value)}
          disabled={targets.length === 0}
          className="px-3 py-2 border border-border rounded-md text-sm bg-transparent"
        >
          {targets.map(output => (
            <option key={output} value={output}>
              {output.toUpperCase()}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={loading || !category || !target}>
          {loading ? 'Converting...' : 'Convert'}
        </Button>
      </form>
      <ul className="text-xs text-muted-foreground">
        {FILE_CONVERSION_CATEGORIES.map(({ label, inputs, outputs }) => (
          <li key={label}>
            {label}: {inputs.join(', ')} → {outputs.join(', ')}
          </li>
        ))}
      </ul>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && (
        <a
          href={result.url}
          download={result.name}
          className="text-sm text-blue-500 hover:underline"
        >
          Download {result.name}
        </a>
      )}
    </div>
  );
}
