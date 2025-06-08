import {
  Box,
  Button,
  Card,
  CheckboxCards,
  DataList,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  CopyPastable,
  CRUDFormProps,
  CRUDItemList,
  Select,
} from '@vigilant-broccoli/react-lib';
import {
  FORM_TYPE,
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODEL,
  LLM_MODELS,
  LLMModel,
} from '@vigilant-broccoli/common-js';
import { LLMPrompt } from '@vigilant-broccoli/common-js';

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
    setFilenames(Array.from(files).map(file => file.name));
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
    <Box maxWidth="600px">
      <CheckboxCards.Root
        defaultValue={selectedFiles}
        columns={{ initial: '1', sm: '3' }}
        onValueChange={setSelectedFiles}
      >
        {files.map(file => {
          return (
            <CheckboxCards.Item value={file} key={file}>
              <Flex direction="column" width="100%">
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

const DEFAULT_PROMPTS = [
  {
    id: 1,
    prompt: { userPrompt: 'userprompt', systemPrompt: 'system prompts' },
    model: LLM_MODEL.GPT_4O,
    results: [],
  },
];

type Prompt = {
  id: number;
  prompt: LLMPrompt;
  model: LLMModel;
  results: string[];
};

const COPY = {
  LIST: {
    TITLE: 'Prompt List',
    EMPTY_MESSAGE: 'No items.',
  },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Create Prompt',
    DESCRIPTION: 'Create item prompt.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Item',
    DESCRIPTION: 'Update item description.',
  },
};

const LLMSimplePromptTester = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(DEFAULT_PROMPTS);

  async function createItem(item: Prompt) {
    return {
      ...item,
      id: Math.max(...prompts.map(item => item.id)) + 1,
    };
  }

  return (
    <>
      <CRUDItemList
        copy={COPY}
        items={prompts}
        setItems={setPrompts}
        ListItemComponent={ListItem}
        FormComponent={Form}
        createItemFormDefaultValues={{
          id: 0,
          prompt: { userPrompt: '', systemPrompt: '' },
          model: LLM_MODEL.GPT_4O,
          results: [],
        }}
        createItem={createItem}
      />
      <CopyPastable text={JSON.stringify(prompts, null, 2)}/>
    </>
  );
};

const Form = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<Prompt>) => {
  const [item, setItem] = useState(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    await submitHandler(item, formType);
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <TextField.Root
          placeholder="System Prompt"
          value={item.prompt.systemPrompt}
          onChange={e =>
            setItem(prev => {
              return {
                ...prev,
                prompt: { ...prev.prompt, systemPrompt: e.target.value },
              };
            })
          }
        />
      </div>

      <div>
        <TextField.Root
          placeholder="User Prompt"
          value={item.prompt.userPrompt}
          onChange={e =>
            setItem(prev => {
              return {
                ...prev,
                prompt: { ...prev.prompt, userPrompt: e.target.value },
              };
            })
          }
        />
      </div>
      <div className="flex items-center space-x-2">
        <label>Model</label>
        <Select
          options={LLM_MODELS}
          selectedOption={item.model}
          setValue={value =>
            setItem(prev => {
              return { ...prev, model: value };
            })
          }
        />
      </div>
      <div>
        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          className="w-full"
        >
          Skicka
        </Button>
      </div>
    </div>
  );
};

const ListItem = ({ item }: { item: Prompt }) => {
  return (
    <Card>
      <DataList.Root>
        <DataList.Item>
          <DataList.Label>System Prompt</DataList.Label>
          <DataList.Value>{item.prompt.systemPrompt}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>User Prompt</DataList.Label>
          <DataList.Value>{item.prompt.userPrompt}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Model</DataList.Label>
          <DataList.Value>{item.model}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Result</DataList.Label>
          <DataList.Value>
            {item.results[item.results.length - 1]}
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </Card>
  );
};
