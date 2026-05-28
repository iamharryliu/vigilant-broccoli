import { useState } from 'react';
import { Flex, Heading } from '@radix-ui/themes';
import { ExternalLink, ArrowRight } from 'lucide-react';
import {
  Button,
  ButtonList,
  ButtonConfig,
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
const noop = () => undefined;

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
    <Flex gap="3" align="center">
      <SpeechToTextButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onToggle={handleToggle}
      />
      <SpeechToTextButton isRecording={false} isDisabled onToggle={noop} />
      <SpeechToTextButton isRecording={false} isProcessing onToggle={noop} />
    </Flex>
  );
}

export function ButtonDemo() {
  const [dark, setDark] = useState(false);

  return (
    <Flex direction="column" gap="6">
      <div>
        <Heading size="4" mb="3">
          Variants
        </Heading>
        <Flex gap="3" wrap="wrap">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Sizes
        </Heading>
        <Flex gap="3" align="center">
          <Button size="xs">XSmall</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          States
        </Heading>
        <Flex gap="3">
          <Button onClick={async () => new Promise(r => setTimeout(r, 1500))}>
            Click to Load
          </Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons
        </Heading>
        <Flex gap="3" align="center">
          <IconButton icon="x" title="Close" />
          <IconButton icon="filter" variant="outline" title="Filter" />
          <IconButton icon="search" variant="ghost" title="Search" />
          <IconButton icon="plus" variant="secondary" title="Add" />
          <IconButton icon="minus" variant="secondary" title="Remove" />
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Delete Icon Button
        </Heading>
        <Flex gap="3" align="center">
          <DeleteIconButton title="Delete" />
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Dark Mode Icon Button
        </Heading>
        <Flex gap="3" align="center">
          <DarkModeIconButton dark={dark} onToggle={setDark} />
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Inline Icons
        </Heading>
        <Flex gap="3" align="center">
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
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Close Button
        </Heading>
        <Flex gap="3" align="center">
          <CloseButton title="Close" />
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Copy Button
        </Heading>
        <Flex gap="3" align="center">
          <CopyButton text="hello copy pastable" />
          <CopyButton
            text={async () => {
              await new Promise(r => setTimeout(r, 1000));
              return 'async result';
            }}
          />
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Monospace Text
        </Heading>
        <Flex direction="column" gap="3">
          <MonospaceText text="192.168.1.1" />
          <MonospaceText text="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3very long ssh key content that should be truncated" />
          <MonospaceText
            text="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3very long ssh key content no truncation"
            truncate={false}
          />
          <MonospaceText text="loading skeleton" loading />
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Social Signin Buttons
        </Heading>
        <Flex direction="column" gap="3" style={{ maxWidth: 300 }}>
          <GoogleSigninButton />
          <MicrosoftSigninButton />
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Speech To Text Button
        </Heading>
        <SpeechToTextButtonDemo />
      </div>

      <div>
        <Heading size="4" mb="3">
          Button List
        </Heading>
        <ButtonList buttons={BUTTON_LIST_BUTTONS} />
      </div>
    </Flex>
  );
}
