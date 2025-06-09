import {
  Box,
  CheckboxCards,
  Flex,
  Text,
} from '@radix-ui/themes';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
import Image from 'next/image';
import { LLMSimplePromptTester } from '../llm/LLMPromptTester';

export const AIDemoPage = () => {
  const [filesnames, setFilenames] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      const response = await fetch('http://localhost:4200/api/files', {
        method: HTTP_METHOD.GET,
        headers: {
          ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        },
      });
      const result = await response.json();
      setFilenames(result);
    }
    init();
  }, []);

  async function handleFiles(files: FileList) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('file', file);
    });

    await fetch('/api/files', {
      method: HTTP_METHOD.POST,
      body: formData,
    });
    setFilenames(prev=>[...prev,...Array.from(files).map(file => file.name)]);
  }

  return (
    <>
      <UploadArea
        onFilesSelected={handleFiles}
        accept="image/*,.pdf"
        multiple
      />
      <FileSelect
        files={filesnames}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />
      <LLMSimplePromptTester />
    </>
  );
};

type UploadAreaProps = {
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
};

export const FileSelect = ({
  files,
  selectedFiles,
  setSelectedFiles,
}: {
  files: string[];
  selectedFiles: string[];
  setSelectedFiles: Dispatch<SetStateAction<string[]>>;
}) => {
  return (
    <Box>
      <CheckboxCards.Root
        defaultValue={selectedFiles}
        columns={{ initial: '1', sm: '3' }}
        onValueChange={setSelectedFiles}
      >
        {files.map(file => {
          return (
            <CheckboxCards.Item value={file} key={file}>
              <Flex direction="column" width="100%">
                <Image src={`/bucket/${file}`} alt='image' fill={true} />
                <Text>{file}</Text>
              </Flex>
            </CheckboxCards.Item>
          );
        })}
      </CheckboxCards.Root>
    </Box>
  );
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
