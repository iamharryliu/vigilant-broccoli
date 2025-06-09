import {
  Button,
  DataList,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useState } from 'react';
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


const DEFAULT_USER_PROMPT = 'Who is the Prime Minister of Canada?';

const DEFAULT_PROMPTS = [
  {
    id: 1,
    prompt: {
      userPrompt: DEFAULT_USER_PROMPT,
      systemPrompt: '',
    },
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

export const LLMSimplePromptTester = () => {
  const [defaultUserPrompt, setDefaultUserPrompt] =
    useState(DEFAULT_USER_PROMPT);
  const [prompts, setPrompts] = useState<Prompt[]>(DEFAULT_PROMPTS);
  const [isLoading, setIsLoading] = useState(false);

  async function createItem(item: Prompt) {
    return {
      ...item,
      id: Math.max(...prompts.map(item => item.id)) + 1,
    };
  }

  async function updateItem(item: Prompt) {
    console.log(`Update ${JSON.stringify(item)}`);
    return;
  }

  async function deleteItem(id: number) {
    console.log(`Delete ${id}`);
  }

  async function onSubmit() {
    setIsLoading(true);
    const response = await fetch('api', {
      method: HTTP_METHOD.POST,
      body: JSON.stringify(prompts),
      headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
    });
    const data = await response.json();
    setPrompts(data);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <Text>Default User Prompt</Text>
        <div className="w-96">
          <TextField.Root
            value={defaultUserPrompt}
            onChange={e => setDefaultUserPrompt(e.target.value)}
          />
        </div>
      </div>
      <CRUDItemList
        copy={COPY}
        items={prompts}
        setItems={setPrompts}
        ListItemComponent={ListItem}
        FormComponent={Form}
        createItemFormDefaultValues={{
          id: 0,
          prompt: { userPrompt: defaultUserPrompt, systemPrompt: '' },
          model: LLM_MODEL.GPT_4O,
          results: [],
        }}
        createItem={createItem}
        updateItem={updateItem}
        deleteItem={deleteItem}
        isCards={true}
      />
      <Button onClick={onSubmit} loading={isLoading}>
        Prompt
      </Button>
      <CopyPastable text={JSON.stringify(prompts, null, 2)} />
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
          Submit
        </Button>
      </div>
    </div>
  );
};

const ListItem = ({ item }: { item: Prompt }) => {
  return (
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
        <DataList.Value>{item.results[item.results.length - 1]}</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
};
