import { Flex, Heading } from '@radix-ui/themes';
import {
  MessageCircle,
  Mail,
  Search,
  Moon,
  Calendar,
  Trash2,
  Play,
  Square,
} from 'lucide-react';
import {
  Button,
  CopyButton,
  GoogleSigninButton,
  MicrosoftSigninButton,
} from '@vigilant-broccoli/react-lib';

export function ButtonDemo() {
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
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons
        </Heading>
        <Flex gap="3" align="center">
          <Button size="icon" title="Message"><MessageCircle size={16} /></Button>
          <Button size="icon" variant="outline" title="Mail"><Mail size={16} /></Button>
          <Button size="icon" variant="ghost" title="Search"><Search size={16} /></Button>
          <Button size="icon" variant="secondary" title="Moon"><Moon size={16} /></Button>
          <Button size="icon" variant="destructive" title="Delete"><Trash2 size={16} /></Button>
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
          Controls
        </Heading>
        <Flex gap="3" align="center">
          <Button size="icon" variant="ghost" title="Play"><Play size={14} /></Button>
          <Button size="icon" variant="ghost" title="Stop"><Square size={14} /></Button>
          <Button size="icon" variant="ghost" disabled title="Disabled"><Play size={14} /></Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Calendar
        </Heading>
        <Flex gap="3" align="center">
          <Button size="icon" variant="outline" title="Calendar sm"><Calendar size={14} /></Button>
          <Button size="icon" variant="outline" title="Calendar md"><Calendar size={16} /></Button>
          <Button size="icon" variant="outline" title="Calendar lg"><Calendar size={20} /></Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Copy Button
        </Heading>
        <Flex gap="3" align="center">
          <CopyButton text="hello copy pastable" />
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
    </Flex>
  );
}
