export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';

export function getJSONFromEnvironmentVariables(text: string) {
  const result: Record<string, string> = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue; // Skip empty lines and comments
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    // Remove surrounding quotes if any
    result[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return result;
}

export function getEnvironmentVariablesFromJSON(text: string): string {
  try {
    const obj = JSON.parse(text?.trim());
    return Object.entries(obj as Record<string, string>)
      .map(([key, value]) => {
        // Quote value if it contains spaces or special characters
        const needsQuotes = /[\s"'`$\\]/.test(value);
        const safeValue = needsQuotes
          ? `"${value.replace(/"/g, '\\"')}"`
          : value;
        return `${key}=${safeValue}`;
      })
      .join('\n');
  } catch {
    return '';
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
} as const;

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE];

export const OPENAI_MODEL = {
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  O3_MINI: 'o3-mini',
  IMAGE_1: 'gpt-image-1',
} as const;
export const OPEN_AI_MODELS = Object.values(OPENAI_MODEL);

export const GEMINI_MODEL = {
  FLASH_2: 'gemini-2.0-flash',
  FLASH_2_LITE: 'gemini-2.0-flash-lite',
} as const;
export const GEMINI_MODELS = Object.values(GEMINI_MODEL);

export const DEEPSEEK_MODEL = {
  DEEP_SEEK: 'deepseek-chat',
} as const;
export const DEEPSEEK_MODELS = Object.values(DEEPSEEK_MODEL);

export const GROK_MODEL = {
  GROK_2_LATEST: 'grok-2-latest',
} as const;
export const GROK_MODELS = Object.values(GROK_MODEL);

export const LLM_MODEL = {
  ...OPENAI_MODEL,
  ...GEMINI_MODEL,
  ...DEEPSEEK_MODEL,
  ...GROK_MODEL,
} as const;
export const LLM_MODELS = Object.values(LLM_MODEL);

export type OpenAIModel = (typeof OPENAI_MODEL)[keyof typeof OPENAI_MODEL];
export type GeminiModel = (typeof GEMINI_MODEL)[keyof typeof GEMINI_MODEL];
export type DeepSeekModel =
  (typeof DEEPSEEK_MODEL)[keyof typeof DEEPSEEK_MODEL];
export type GrokModel = (typeof GROK_MODEL)[keyof typeof GROK_MODEL];

export type LLMModel = (typeof LLM_MODEL)[keyof typeof LLM_MODEL];

export type LLMModelConfig = {
  model: LLMModel;
  apiKey?: string;
  max_tokens?: number;
  temperature?: number;
};

export type LLMPrompt = {
  userPrompt: string;
  systemPrompt?: string;
};
