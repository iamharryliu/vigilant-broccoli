import { Badge, Box, Button, Flex, Text, TextArea, Select as RadixSelect } from '@radix-ui/themes';
import { useState, useRef } from 'react';
import { CopyPastable, Select } from '@vigilant-broccoli/react-lib';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODELS,
  LLMModel,
  modelSupportsImageOutput,
  modelSupportsImageInput,
} from '@vigilant-broccoli/common-js';
import Image from 'next/image';

type OutputType = 'text' | 'image';

type TestResults = {
  userPrompt: string;
  systemPrompt: string;
  results: Record<LLMModel, string[]>;
};

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

export const LLMSimplePromptTester = () => {
  const [userPrompt, setUserPrompt] = useState('Who is the Prime Minister of Canada?');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<LLMModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [outputType, setOutputType] = useState<OutputType>('text');
  const [numOutputs, setNumOutputs] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addModel = (model: LLMModel) => {
    if (!selectedModels.includes(model)) {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const removeModel = (model: LLMModel) => {
    setSelectedModels(selectedModels.filter(m => m !== model));
  };

  const handleOutputTypeChange = (newOutputType: OutputType) => {
    setOutputType(newOutputType);
    // Clear selected models when switching output type
    setSelectedModels([]);
  };

  // Filter models based on output type and image input
  const availableModels = LLM_MODELS.filter(m => {
    if (selectedModels.includes(m)) return false;

    // Filter by output type
    if (outputType === 'image') {
      if (!modelSupportsImageOutput(m)) return false;
    } else {
      // For text output, exclude image generation models
      if (modelSupportsImageOutput(m)) return false;
    }

    // If images are uploaded, only show models that support image input
    if (uploadedImages.length > 0 && !modelSupportsImageInput(m)) {
      return false;
    }

    return true;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      const imagePromise = new Promise<UploadedImage>((resolve) => {
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          // Remove the data URL prefix to get just the base64 string
          const base64Data = base64.split(',')[1];
          resolve({
            name: file.name,
            base64: base64Data,
            mimeType: file.type,
          });
        };
      });
      reader.readAsDataURL(file);
      newImages.push(await imagePromise);
    }

    const updatedImages = [...uploadedImages, ...newImages];
    setUploadedImages(updatedImages);

    // Remove selected models that don't support image input
    if (updatedImages.length > 0) {
      setSelectedModels(selectedModels.filter(m => modelSupportsImageInput(m)));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  async function handleSubmit() {
    if (selectedModels.length === 0) {
      alert('Please select at least one model');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/llm-test', {
        method: HTTP_METHOD.POST,
        body: JSON.stringify({
          userPrompt,
          systemPrompt,
          models: selectedModels,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          numOutputs,
        }),
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
      });
      const data = await response.json();

      setTestResults({
        userPrompt,
        systemPrompt,
        results: data.results,
      });
    } catch (error) {
      console.error('Error testing prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const outputJson = testResults ? JSON.stringify(testResults, null, 2) : '';

  return (
    <Flex direction="column" gap="4">
      <Text size="5" weight="bold">
        LLM Prompt Tester
      </Text>

      <Box>
        <Text size="2" weight="medium" mb="2" className="block">
          System Prompt
        </Text>
        <TextArea
          placeholder="Enter system prompt (optional)..."
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          rows={3}
          className="w-full"
        />
      </Box>

      <Flex gap="3">
        <Box className="flex-1">
          <Text size="2" weight="medium" mb="2" className="block">
            Expected Output Type
          </Text>
          <RadixSelect.Root value={outputType} onValueChange={(value) => handleOutputTypeChange(value as OutputType)}>
            <RadixSelect.Trigger />
            <RadixSelect.Content>
              <RadixSelect.Item value="text">Text</RadixSelect.Item>
              <RadixSelect.Item value="image">Image</RadixSelect.Item>
            </RadixSelect.Content>
          </RadixSelect.Root>
        </Box>

        <Box className="flex-1">
          <Text size="2" weight="medium" mb="2" className="block">
            Number of Outputs
          </Text>
          <Select
            selectedOption={numOutputs}
            setValue={setNumOutputs}
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          />
        </Box>
      </Flex>

      <Box>
        <Text size="2" weight="medium" mb="2" className="block">
          User Prompt
        </Text>
        <TextArea
          placeholder="Enter user prompt..."
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          rows={4}
          className="w-full"
        />
      </Box>

      <Box>
        <Text size="2" weight="medium" mb="2" className="block">
          Images (Optional)
        </Text>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          size="2"
        >
          Upload Images
        </Button>
        {uploadedImages.length > 0 && (
          <Flex gap="2" wrap="wrap" mt="3">
            {uploadedImages.map((img, idx) => (
              <Box key={idx} className="relative group">
                <div className="relative w-24 h-24 border rounded overflow-hidden">
                  <Image
                    src={`data:${img.mimeType};base64,${img.base64}`}
                    alt={img.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <Badge
                  size="1"
                  color="red"
                  className="absolute -top-2 -right-2 cursor-pointer"
                  onClick={() => removeImage(idx)}
                >
                  ✕
                </Badge>
              </Box>
            ))}
          </Flex>
        )}
      </Box>

      <Box>
        <Text size="2" weight="medium" mb="2" className="block">
          Selected Models ({selectedModels.length})
        </Text>
        <Flex gap="2" wrap="wrap" mb="3">
          {selectedModels.length === 0 ? (
            <Text size="2" color="gray">
              Click models below to add them
            </Text>
          ) : (
            selectedModels.map(model => (
              <Badge
                key={model}
                size="2"
                color="green"
                className="cursor-pointer"
                onClick={() => removeModel(model)}
              >
                {model} ✕
              </Badge>
            ))
          )}
        </Flex>

        {availableModels.length > 0 && (
          <Box>
            <Text size="2" weight="medium" mb="2" className="block">
              Available Models
            </Text>
            <Flex gap="2" wrap="wrap">
              {availableModels.map(model => (
                <Badge
                  key={model}
                  size="2"
                  color="gray"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => addModel(model)}
                >
                  {model} +
                </Badge>
              ))}
            </Flex>
          </Box>
        )}
      </Box>

      <Button onClick={handleSubmit} loading={isLoading} size="3">
        Test Prompts
      </Button>

      {testResults && (
        <Box>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="medium">
              Results
            </Text>
          </Flex>
          <CopyPastable text={outputJson} />
        </Box>
      )}
    </Flex>
  );
};
