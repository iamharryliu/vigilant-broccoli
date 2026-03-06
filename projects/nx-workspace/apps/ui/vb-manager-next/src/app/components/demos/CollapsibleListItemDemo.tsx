'use client';

import { useState } from 'react';
import { Flex, Heading, Text, Box } from '@radix-ui/themes';
import { CollapsibleListItem } from '../collapsible-list-item.component';

export const CollapsibleListItemDemo = () => {
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(true);
  const [isOpen3, setIsOpen3] = useState(false);

  return (
    <Flex direction="column" gap="6">
      <div>
        <Heading size="4" mb="3">
          Basic Usage
        </Heading>
        <CollapsibleListItem
          title="Simple Collapsible"
          isOpen={isOpen1}
          setIsOpen={setIsOpen1}
        >
          <Text>This is the content inside the collapsible item.</Text>
        </CollapsibleListItem>
      </div>

      <div>
        <Heading size="4" mb="3">
          With Rich Content
        </Heading>
        <CollapsibleListItem
          title="Rich Content Example"
          isOpen={isOpen2}
          setIsOpen={setIsOpen2}
        >
          <Box>
            <Text weight="bold">Section 1</Text>
            <Text>Content for the first section with multiple paragraphs.</Text>
          </Box>
          <Box>
            <Text weight="bold">Section 2</Text>
            <Text>More content demonstrating the animation.</Text>
          </Box>
          <Box>
            <Text weight="bold">Section 3</Text>
            <Text>Additional content to show smooth transitions.</Text>
          </Box>
        </CollapsibleListItem>
      </div>

      <div>
        <Heading size="4" mb="3">
          Without Border
        </Heading>
        <CollapsibleListItem
          title="No Border Example"
          isOpen={isOpen3}
          setIsOpen={setIsOpen3}
          showBorder={false}
        >
          <Text>This collapsible item has no border styling.</Text>
        </CollapsibleListItem>
      </div>
    </Flex>
  );
};
