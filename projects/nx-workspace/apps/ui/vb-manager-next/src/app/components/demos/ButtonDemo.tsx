'use client';

import { Button, Flex, Grid, Heading, IconButton } from '@radix-ui/themes';
import { useState } from 'react';
import {
  MessageCircle,
  Mail,
  Search,
  Moon,
  Calendar,
  StickyNote,
  Trash2,
  Pencil,
  Plus,
  Menu,
  Play,
  Square,
  ChevronLeft,
} from 'lucide-react';

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
      </div>

      <div>
        <Heading size="4" mb="3">
          States
        </Heading>
        <Flex gap="3">
          <Button loading={mockLoading} onClick={handleMockLoad}>Click to Load</Button>
          <Button disabled>Disabled</Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons - Variants
        </Heading>
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
          Icon Buttons - Sizes
        </Heading>
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
          Icon Buttons - Floating Island Style
        </Heading>
        <Flex gap="3" align="center">
          <IconButton variant="soft" size="2" title="Chat">
            <MessageCircle size={20} />
          </IconButton>
          <IconButton variant="soft" size="2" title="Email">
            <Mail size={20} />
          </IconButton>
          <IconButton variant="soft" size="2" title="Calendar">
            <Calendar size={20} />
          </IconButton>
          <IconButton variant="soft" size="2" title="Notepad">
            <StickyNote size={20} />
          </IconButton>
          <IconButton variant="soft" size="2" title="Search">
            <Search size={20} />
          </IconButton>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          Icon Buttons - Kanban Actions
        </Heading>
        <Flex gap="3" align="center">
          <IconButton size="1" variant="ghost" title="Menu">
            <Menu size={14} />
          </IconButton>
          <IconButton size="1" variant="ghost" title="Edit">
            <Pencil size={14} />
          </IconButton>
          <IconButton size="1" variant="ghost" color="red" title="Delete">
            <Trash2 size={14} />
          </IconButton>
          <IconButton size="1" variant="ghost" title="Add">
            <Plus size={14} />
          </IconButton>
          <IconButton size="2" variant="ghost" title="Collapse">
            <ChevronLeft size={16} />
          </IconButton>
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
