import { Badge, Text } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { useState, useRef } from 'react';
import { CopyPastable, Select, Textarea } from '@vigilant-broccoli/react-lib';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODELS,
  LLMModel,
  modelSupportsImageOutput,
  modelSupportsImageInput,
} from '@vigilant-broccoli/common-js';
import Image from 'next/image';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

type OutputType = 'text' | 'image';

const OUTPUT_TYPE_OPTIONS: OutputType[] = ['text', 'image'];
const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  text: 'Text',
  image: 'Image',
};

const NUM_OUTPUT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
  const [userPrompt, setUserPrompt] = useState(
    'Who is the Prime Minister of Canada?',
  );
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
      const imagePromise = new Promise<UploadedImage>(resolve => {
        reader.onload = e => {
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
      const response = await fetch(API_ENDPOINTS.LLM_TEST, {
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
    <div className="flex flex-col gap-4">
      <Text size="5" weight="bold">
        LLM Prompt Tester
      </Text>

      <div>
        <Text size="2" weight="medium" mb="2" className="block">
          System Prompt
        </Text>
        <Textarea
          placeholder="Enter system prompt (optional)..."
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          rows={3}
          className="w-full"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Text size="2" weight="medium" mb="2" className="block">
            Expected Output Type
          </Text>
          <Select
            selectedOption={outputType}
            setValue={handleOutputTypeChange}
            options={OUTPUT_TYPE_OPTIONS}
            displayMapper={OUTPUT_TYPE_LABELS}
          />
        </div>

        <div className="flex-1">
          <Text size="2" weight="medium" mb="2" className="block">
            Number of Outputs
          </Text>
          <Select
            selectedOption={numOutputs}
            setValue={setNumOutputs}
            options={NUM_OUTPUT_OPTIONS}
          />
        </div>
      </div>

      <div>
        <Text size="2" weight="medium" mb="2" className="block">
          User Prompt
        </Text>
        <Textarea
          placeholder="Enter user prompt..."
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>

      <div>
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
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Upload Images
        </Button>
        {uploadedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {uploadedImages.map((img, idx) => (
              <div className="relative group" key={idx}>
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
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Text size="2" weight="medium" mb="2" className="block">
          Selected Models ({selectedModels.length})
        </Text>
        <div className="flex gap-2 flex-wrap mb-3">
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
        </div>

        {availableModels.length > 0 && (
          <div>
            <Text size="2" weight="medium" mb="2" className="block">
              Available Models
            </Text>
            <div className="flex gap-2 flex-wrap">
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
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleSubmit} loading={isLoading} size="lg">
        Test Prompts
      </Button>

      {testResults && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text size="4" weight="bold">
              Results
            </Text>
          </div>

          <div className="flex flex-col gap-6">
            {Object.entries(testResults.results).map(([model, outputs]) => {
              const isImageOutput = modelSupportsImageOutput(model as LLMModel);

              return (
                <div className="border rounded-lg p-4" key={model}>
                  <Text size="3" weight="bold" mb="3" className="block">
                    {model}
                  </Text>

                  {testResults.systemPrompt && (
                    <div className="mb-3">
                      <Text size="2" weight="medium" className="block mb-1">
                        System Prompt:
                      </Text>
                      <Text size="2" color="gray" className="block">
                        {testResults.systemPrompt}
                      </Text>
                    </div>
                  )}

                  <div className="mb-3">
                    <Text size="2" weight="medium" className="block mb-1">
                      User Prompt:
                    </Text>
                    <Text size="2" color="gray" className="block">
                      {testResults.userPrompt}
                    </Text>
                  </div>

                  {isImageOutput ? (
                    <div>
                      <Text size="2" weight="medium" className="block mb-2">
                        Generated Images:
                      </Text>
                      <div className="flex gap-3 flex-wrap">
                        {outputs.map((imageUrl, index) => (
                          <div className="border rounded overflow-hidden" key={index}>
                            <img
                              src={imageUrl}
                              alt={`${model} output ${index + 1}`}
                              className="w-64 h-64 object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Text size="2" weight="medium" className="block mb-2">
                        Output{outputs.length > 1 ? 's' : ''}:
                      </Text>
                      <div className="flex flex-col gap-2">
                        {outputs.map((output, index) => (
                          <div className="p-3 rounded" key={index}>
                            <Text size="2" className="whitespace-pre-wrap">
                              {output}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Text size="2" weight="medium" mb="2" className="block">
              Raw JSON Output
            </Text>
            <CopyPastable text={outputJson} />
          </div>
        </div>
      )}
    </div>
  );
};
