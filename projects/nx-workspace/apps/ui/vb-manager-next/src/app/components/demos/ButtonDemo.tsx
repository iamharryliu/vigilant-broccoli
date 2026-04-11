'use client';

import { Button, Flex, Grid, Heading, IconButton } from '@radix-ui/themes';
import { useState } from 'react';
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
import { CopyButton } from '@vigilant-broccoli/react-lib';

export function ButtonDemo() {
  const [mockLoading, setMockLoading] = useState(false);

  const handleMockLoad = () => {
    setMockLoading(true);
    setTimeout(() => setMockLoading(false), 1000);
  };

  return (
    <Flex direction="column" gap="6">
      <div>
        <Heading size="4" mb="3">
          Variants
        </Heading>
        <Grid columns="4" gap="3" width="100%">
          <Button>Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </Grid>

        <Flex gap="3" align="center">
          <IconButton title="Solid">
            <MessageCircle size={16} />
          </IconButton>
          <IconButton variant="soft" title="Soft">
            <Mail size={16} />
          </IconButton>
          <IconButton variant="outline" title="Outline">
            <Search size={16} />
          </IconButton>
          <IconButton variant="ghost" title="Ghost">
            <Moon size={16} />
          </IconButton>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Sizes
        </Heading>
        <Flex gap="3" align="center">
          <Button size="1">Small</Button>
          <Button size="2">Medium (default)</Button>
          <Button size="3">Large</Button>
        </Flex>

        <Flex gap="3" align="center">
          <IconButton size="1" variant="soft" title="Small">
            <Calendar size={14} />
          </IconButton>
          <IconButton size="2" variant="soft" title="Medium">
            <Calendar size={16} />
          </IconButton>
          <IconButton size="3" variant="soft" title="Large">
            <Calendar size={20} />
          </IconButton>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          States
        </Heading>
        <Flex gap="3">
          <Button loading={mockLoading} onClick={handleMockLoad}>
            Click to Load
          </Button>
          <Button disabled>Disabled</Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons - Colors (Soft)
        </Heading>
        <Flex gap="3" align="center">
          <IconButton variant="soft" color="blue" title="Blue">
            <MessageCircle size={16} />
          </IconButton>
          <IconButton variant="soft" color="green" title="Green">
            <Mail size={16} />
          </IconButton>
          <IconButton variant="soft" color="red" title="Red">
            <Trash2 size={16} />
          </IconButton>
          <IconButton variant="soft" color="orange" title="Orange">
            <Search size={16} />
          </IconButton>
          <IconButton variant="soft" color="purple" title="Purple">
            <Calendar size={16} />
          </IconButton>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons - Colors (Ghost)
        </Heading>
        <Flex gap="3" align="center">
          <IconButton variant="ghost" color="blue" title="Blue">
            <MessageCircle size={16} />
          </IconButton>
          <IconButton variant="ghost" color="green" title="Green">
            <Mail size={16} />
          </IconButton>
          <IconButton variant="ghost" color="red" title="Red">
            <Trash2 size={16} />
          </IconButton>
          <IconButton variant="ghost" color="orange" title="Orange">
            <Search size={16} />
          </IconButton>
          <IconButton variant="ghost" color="purple" title="Purple">
            <Calendar size={16} />
          </IconButton>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons - Colors (Outline)
        </Heading>
        <Flex gap="3" align="center">
          <IconButton variant="outline" color="blue" title="Blue">
            <MessageCircle size={16} />
          </IconButton>
          <IconButton variant="outline" color="green" title="Green">
            <Mail size={16} />
          </IconButton>
          <IconButton variant="outline" color="red" title="Red">
            <Trash2 size={16} />
          </IconButton>
          <IconButton variant="outline" color="orange" title="Orange">
            <Search size={16} />
          </IconButton>
          <IconButton variant="outline" color="purple" title="Purple">
            <Calendar size={16} />
          </IconButton>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons - Colors (Solid)
        </Heading>
        <Flex gap="3" align="center">
          <IconButton variant="solid" color="blue" title="Blue">
            <MessageCircle size={16} />
          </IconButton>
          <IconButton variant="solid" color="green" title="Green">
            <Mail size={16} />
          </IconButton>
          <IconButton variant="solid" color="red" title="Red">
            <Trash2 size={16} />
          </IconButton>
          <IconButton variant="solid" color="orange" title="Orange">
            <Search size={16} />
          </IconButton>
          <IconButton variant="solid" color="purple" title="Purple">
            <Calendar size={16} />
          </IconButton>
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
          Icon Buttons - Controls
        </Heading>
        <Flex gap="3" align="center">
          <IconButton size="1" variant="soft" title="Play">
            <Play size={14} />
          </IconButton>
          <IconButton size="1" variant="soft" title="Stop">
            <Square size={14} />
          </IconButton>
          <IconButton size="1" variant="soft" disabled title="Disabled">
            <Play size={14} />
          </IconButton>
        </Flex>
      </div>
    </Flex>
  );
}
