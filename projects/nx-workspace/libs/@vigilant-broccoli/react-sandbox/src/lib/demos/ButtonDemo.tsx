import { useState } from 'react';
import { Heading } from '@radix-ui/themes';
import { ExternalLink, ArrowRight } from 'lucide-react';
import {
  Button,
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
const CHAT_INPUT_PLACEHOLDER = 'Type a message...';
const noop = () => undefined;

function ChatSendButtonDemo() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setIsStreaming(true);
    setTimeout(() => setIsStreaming(false), MOCK_STREAM_DELAY_MS);
  };

  const handleStop = () => setIsStreaming(false);

  return (
    <div className="flex gap-3 items-center">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={CHAT_INPUT_PLACEHOLDER}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--gray-6)',
          minWidth: '14rem',
        }}
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
    <div className="flex gap-3 items-center">
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
  const [dark, setDark] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading size="4" mb="3">
          Variants
        </Heading>
        <div className="flex gap-3 flex-wrap">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Sizes
        </Heading>
        <div className="flex gap-3 items-center">
          <Button size="xs">XSmall</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          States
        </Heading>
        <div className="flex gap-3">
          <Button onClick={async () => new Promise(r => setTimeout(r, 1500))}>
            Click to Load
          </Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons
        </Heading>
        <div className="flex gap-3 items-center">
          <IconButton icon="x" title="Close" />
          <IconButton icon="filter" variant="outline" title="Filter" />
          <IconButton icon="search" variant="ghost" title="Search" />
          <IconButton icon="plus" variant="secondary" title="Add" />
          <IconButton icon="minus" variant="secondary" title="Remove" />
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Delete Icon Button
        </Heading>
        <div className="flex gap-3 items-center">
          <DeleteIconButton title="Delete" />
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Dark Mode Icon Button
        </Heading>
        <div className="flex gap-3 items-center">
          <DarkModeIconButton dark={dark} onToggle={setDark} />
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Inline Icons
        </Heading>
        <div className="flex gap-3 items-center">
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
      </div>

      <div>
        <Heading size="4" mb="3">
          Close Button
        </Heading>
        <div className="flex gap-3 items-center">
          <CloseButton title="Close" />
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Copy Button
        </Heading>
        <div className="flex gap-3 items-center">
          <CopyButton text="hello copy pastable" />
          <CopyButton
            text={async () => {
              await new Promise(r => setTimeout(r, 1000));
              return 'async result';
            }}
          />
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Monospace Text
        </Heading>
        <div className="flex flex-col gap-3">
          <MonospaceText text="192.168.1.1" />
          <MonospaceText text="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3very long ssh key content that should be truncated" />
          <MonospaceText
            text="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3very long ssh key content no truncation"
            truncate={false}
          />
          <MonospaceText text="loading skeleton" loading />
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Social Signin Buttons
        </Heading>
        <div className="flex flex-col gap-3" style={{ maxWidth: 300 }}>
          <GoogleSigninButton />
          <MicrosoftSigninButton />
        </div>
      </div>

      <div>
        <Heading size="4" mb="3">
          Speech To Text Button
        </Heading>
        <SpeechToTextButtonDemo />
      </div>

      <div>
        <Heading size="4" mb="3">
          Chat Send Button
        </Heading>
        <ChatSendButtonDemo />
      </div>

      <div>
        <Heading size="4" mb="3">
          Button List
        </Heading>
        <ButtonList buttons={BUTTON_LIST_BUTTONS} />
      </div>
    </div>
  );
}
