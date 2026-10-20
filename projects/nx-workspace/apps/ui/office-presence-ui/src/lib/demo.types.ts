export type TextObject = { type: string; text: string };

export type SlackOption = {
  value: string;
  text: TextObject;
  description?: TextObject;
};

export type SlackElement = {
  type: string;
  action_id?: string;
  text?: TextObject;
  style?: string;
  value?: string;
  confirm?: { text: TextObject };
  options?: SlackOption[];
  initial_option?: SlackOption | null;
  initial_options?: SlackOption[];
  initial_users?: string[];
  initial_value?: string;
  multiline?: boolean;
  max_length?: number;
  placeholder?: TextObject;
};

export type SlackBlock = {
  type: string;
  block_id?: string;
  text?: TextObject;
  accessory?: SlackElement;
  elements?: (SlackElement | TextObject)[];
  element?: SlackElement;
  label?: TextObject;
  optional?: boolean;
};

export type SlackView = {
  title?: TextObject;
  close?: TextObject;
  submit?: TextObject;
  callback_id?: string;
  blocks: SlackBlock[];
};

export type DemoUser = {
  id: string;
  realName: string;
  title: string;
  color?: string;
  homeOffice?: string;
};

export type DemoMessage = {
  id: number;
  text: string;
  channelLabel: string;
  ephemeral: boolean;
};

export type DemoSnapshot = {
  appName: string;
  botUserId: string;
  users: DemoUser[];
  home: SlackView | null;
  modals: SlackView[];
  messages: DemoMessage[];
};

export type ElementState = {
  type: string;
  selected_options?: { value: string }[];
  selected_option?: { value: string } | null;
  selected_users?: string[];
  value?: string | null;
};

export type ViewStateValues = Record<string, Record<string, ElementState>>;
