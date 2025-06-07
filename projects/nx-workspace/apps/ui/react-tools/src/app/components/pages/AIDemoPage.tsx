import { Button, TextArea } from '@radix-ui/themes';
import { Layout } from '../layout/Layout';
import { useRef, useState } from 'react';
import { CopyPastable } from '@vigilant-broccoli/react-lib';


export const AIDemoPage = () => {
  const [userPrompt, setUserPrompt] = useState(
    'Who is the Prime Minister of Canada?',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userPromptResult, setUserPromptResult] = useState('');

  async function prompt() {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPrompt }),
      });
      const result = await response.json();
      setUserPromptResult(result.data);
    } catch (e) {
      alert(`error ${e}`);
    } finally {
      setIsLoading(false);
    }
  }
  const handleFiles = (files: FileList) => {
    console.log('Selected files:', Array.from(files));
    // Upload logic here
  };

  return (
    <Layout>
      <span>User Prompt</span>
      <div className="flex w-full space-x-4">
        <div className="w-1/2">
          <TextArea
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
          ></TextArea>
          <Button onClick={prompt} loading={isLoading}>
            Submit
          </Button>
        </div>
        <div className="w-1/2">
          <CopyPastable text={userPromptResult} />
        </div>
      </div>
      <UploadArea
        onFilesSelected={handleFiles}
        accept="image/*,.pdf"
        multiple
      />
    </Layout>
  );
};

type UploadAreaProps = {
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
};

export function UploadArea({
  onFilesSelected,
  accept,
  multiple = false,
}: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`cursor-pointer w-full p-8 border-2 border-dashed rounded-lg transition text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <p className="text-gray-700">
        {dragActive ? 'Drop files here...' : 'Click or drag files to upload'}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
