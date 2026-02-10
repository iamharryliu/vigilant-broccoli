import { PlainTextElement } from '@slack/types';

function generatePlainText(text: string): PlainTextElement {
  return {
    type: 'plain_text',
    text,
  };
}

function generateMarkdownText(markdown: string) {
  return {
    type: 'mrkdwn',
    text: markdown,
  };
}

function generateHeader(text: string) {
  return {
    type: 'header',
    text: generatePlainText(text),
  };
}

function generateMarkdownSection(markdown: string) {
  return {
    type: 'section',
    text: generateMarkdownText(markdown),
  };
}

export const SlackViewBuilder = {
  generatePlainText,
  generateMarkdownSection,
  generateHeader,
  DIVIDER: { type: 'divider' },
};
