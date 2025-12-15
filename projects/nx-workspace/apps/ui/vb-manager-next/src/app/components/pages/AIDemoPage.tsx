import {
  Box,
  Button,
  Card,
  CheckboxCards,
  Flex,
  Text,
  TextArea,
} from '@radix-ui/themes';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import Image from 'next/image';
import { LLMSimplePromptTester } from '../llm/LLMPromptTester';
import { Select } from '@vigilant-broccoli/react-lib';

export const AIDemoPage = () => {
  const [filesnames, setFilenames] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfImagesToGenerate, setNumberOfImagesToGenerate] = useState(1);

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
    setFilenames(prev => [
      ...prev,
      ...Array.from(files).map(file => file.name),
    ]);
  }
  async function handleSubmit() {
    setIsLoading(true);
    await fetch('/api/image-generation', {
      method: HTTP_METHOD.POST,
      body: JSON.stringify({
        prompt: imagePrompt,
        selectedFiles,
        n: numberOfImagesToGenerate,
      }),
    });
    setIsLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">
            Image Generation
          </Text>

          <Box>
            <Text size="2" weight="medium" mb="2" className="block">
              Upload Files
            </Text>
            <UploadArea
              onFilesSelected={handleFiles}
              accept="image/*,.pdf"
              multiple
            />
          </Box>

          {filesnames.length > 0 && (
            <Box>
              <Text size="2" weight="medium" mb="2" className="block">
                Select Files
              </Text>
              <FileSelect
                files={filesnames}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            </Box>
          )}

          <Box>
            <Text size="2" weight="medium" mb="2" className="block">
              Prompt
            </Text>
            <TextArea
              placeholder="Describe the image you want to generate..."
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
              rows={4}
              className="w-full"
            />
          </Box>

          <Flex gap="3" align="center">
            <Box className="flex-1">
              <Text size="2" weight="medium" mb="2" className="block">
                Number of Images
              </Text>
              <Select
                selectedOption={numberOfImagesToGenerate}
                setValue={setNumberOfImagesToGenerate}
                options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              />
            </Box>

            <Button
              onClick={handleSubmit}
              loading={isLoading}
              size="3"
              className="mt-6"
            >
              Generate Image(s)
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Card>
        <Box p="4">
          <LLMSimplePromptTester />
        </Box>
      </Card>
    </div>
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
        columns={{ initial: '1', sm: '2', md: '3', lg: '4' }}
        onValueChange={setSelectedFiles}
        gap="3"
      >
        {files.map(file => {
          return (
            <CheckboxCards.Item value={file} key={file} className="group">
              <Flex direction="column" width="100%" gap="2">
                <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                  <Image
                    src={`/bucket/${file}`}
                    alt={file}
                    fill={true}
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <Text size="2" className="truncate" title={file}>
                  {file}
                </Text>
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
      className={`cursor-pointer w-full p-10 border-2 border-dashed rounded-lg transition-all duration-200 text-center ${
        dragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400 scale-[1.02]'
          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <svg
          className={`w-12 h-12 transition-colors ${
            dragActive
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-600'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p
          className={`text-sm font-medium ${
            dragActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {dragActive ? 'Drop files here...' : 'Click or drag files to upload'}
        </p>
        {!dragActive && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {accept || 'All file types accepted'}
          </p>
        )}
      </div>

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
