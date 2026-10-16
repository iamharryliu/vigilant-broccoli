import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';
import { useState } from 'react';

import { ExternalLink, ArrowRight } from 'lucide-react';
import {
  Button,
  Input,
  ButtonList,
  ButtonConfig,
  ChatSendButton,
  CloseButton,
  CopyButton,
  DarkModeIconButton,
  DeleteIconButton,
  IconButton,
  MonospaceText,
  GoogleSigninButton,
  MicrosoftSigninButton,
  SpeechToTextButton,
} from '@vigilant-broccoli/react-lib';
import { AudioButtonDemo } from './AudioButtonDemo';

const BUTTON_LIST_BUTTONS: ButtonConfig[] = [
  'GitHub',
  'Google',
  'YouTube',
  'LinkedIn',
  'Spotify',
  'Notion',
  'Figma',
  'Vercel',
  'Slack',
  'Discord',
  'Twitch',
  'Reddit',
  'Twitter',
  'Instagram',
  'Facebook',
  'TikTok',
  'AWS',
  'GCP',
  'Azure',
  'Cloudflare',
  'Heroku',
  'Railway',
  'Supabase',
  'Firebase',
].map(label => ({ label, onClick: () => alert(label) }));

const MOCK_PROCESS_DELAY_MS = 1500;
const MOCK_STREAM_DELAY_MS = 2500;
const noop = () => undefined;

function ChatSendButtonDemo() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setIsStreaming(true);
    setTimeout(() => setIsStreaming(false), MOCK_STREAM_DELAY_MS);
  };

  const handleStop = () => setIsStreaming(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={t('DEMO_SECTION.BUTTON.CHAT_PLACEHOLDER')}
        aria-label={t('DEMO_SECTION.BUTTON.CHAT_PLACEHOLDER')}
        className="w-56 max-w-full"
      />
      <ChatSendButton
        isStreaming={isStreaming}
        isDisabled={!input.trim()}
        onSend={handleSend}
        onStop={handleStop}
      />
    </div>
  );
}

function SpeechToTextButtonDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    if (isRecording) {
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, MOCK_PROCESS_DELAY_MS));
      setIsProcessing(false);
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SpeechToTextButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onToggle={handleToggle}
      />
      <SpeechToTextButton isRecording={false} isDisabled onToggle={noop} />
      <SpeechToTextButton isRecording={false} isProcessing onToggle={noop} />
    </div>
  );
}

export function ButtonDemo() {
  const { t } = useTranslation();
  const [dark, setDark] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.BUTTON.VARIANTS')}>
        <div className="flex gap-3 flex-wrap">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.SIZES')}>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">XSmall</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.STATES')}>
        <div className="flex flex-wrap gap-3">
          <Button onClick={async () => new Promise(r => setTimeout(r, 1500))}>
            Click to Load
          </Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.INLINE_ICONS')}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <ArrowRight size={14} className="shrink-0" />
            inline-start
          </Button>
          <Button>
            inline-end
            <ExternalLink size={14} className="shrink-0" />
          </Button>
          <Button variant="secondary">
            <ArrowRight size={14} className="shrink-0" />
            Both
            <ExternalLink size={14} className="shrink-0" />
          </Button>
        </div>
      </DemoSection>

      <div className="flex flex-col gap-6">
        <DemoSection title={t('DEMO_SECTION.BUTTON.ICON_BUTTONS')}>
          <div className="flex flex-wrap items-center gap-3">
            <IconButton icon="x" title="Close" />
            <IconButton icon="filter" variant="outline" title="Filter" />
            <IconButton icon="search" variant="ghost" title="Search" />
            <IconButton icon="plus" variant="secondary" title="Add" />
            <IconButton icon="minus" variant="secondary" title="Remove" />
          </div>
        </DemoSection>

        <DemoSection title={t('DEMO_SECTION.BUTTON.DELETE_ICON_BUTTON')}>
          <div className="flex flex-wrap items-center gap-3">
            <DeleteIconButton title="Delete" />
          </div>
        </DemoSection>

        <DemoSection title={t('DEMO_SECTION.BUTTON.DARK_MODE_ICON_BUTTON')}>
          <div className="flex flex-wrap items-center gap-3">
            <DarkModeIconButton dark={dark} onToggle={setDark} />
          </div>
        </DemoSection>

        <DemoSection title={t('DEMO_SECTION.BUTTON.CLOSE_BUTTON')}>
          <div className="flex flex-wrap items-center gap-3">
            <CloseButton title="Close" />
          </div>
        </DemoSection>

        <DemoSection title={t('DEMO_SECTION.BUTTON.COPY_BUTTON')}>
          <div className="flex flex-wrap items-center gap-3">
            <CopyButton text="hello copy pastable" />
            <CopyButton
              text={async () => {
                await new Promise(r => setTimeout(r, 1000));
                return 'async result';
              }}
            />
          </div>
        </DemoSection>

        <DemoSection title={t('DEMO_SECTION.BUTTON.SPEECH_TO_TEXT_BUTTON')}>
          <SpeechToTextButtonDemo />
        </DemoSection>

        <DemoSection title={t('DEMO_SECTION.BUTTON.AUDIO_BUTTON')}>
          <AudioButtonDemo />
        </DemoSection>
      </div>

      <DemoSection
        title={t('DEMO_SECTION.BUTTON.MONOSPACE_TEXT')}
        className="overflow-x-auto"
      >
        <div className="flex flex-col gap-3">
          <MonospaceText text="192.168.1.1" />
          <MonospaceText text="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3very long ssh key content that should be truncated" />
          <MonospaceText
            text="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3very long ssh key content no truncation"
            truncate={false}
          />
          <MonospaceText text="loading skeleton" loading />
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.SOCIAL_SIGNIN_BUTTONS')}>
        <div className="flex flex-col gap-3" style={{ maxWidth: 300 }}>
          <GoogleSigninButton />
          <MicrosoftSigninButton />
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.CHAT_SEND_BUTTON')}>
        <ChatSendButtonDemo />
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.BUTTON_LIST')}>
        <ButtonList buttons={BUTTON_LIST_BUTTONS} />
      </DemoSection>
    </div>
  );
}
