import { Flex, Heading, Text, Box } from '@radix-ui/themes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { CollapsibleList } from '@vigilant-broccoli/react-lib';

export const CollapsibleListItemDemo = () => (
  <Flex direction="column" gap="6">
    <div>
      <Heading size="4" mb="3">
        With Rich Content
      </Heading>
      <Accordion type="single" collapsible defaultValue="rich">
        <AccordionItem value="rich">
          <AccordionTrigger>Rich Content Example</AccordionTrigger>
          <AccordionContent>
            <Flex direction="column" gap="2">
              <Box>
                <Text weight="bold">Section 1</Text>
                <Text as="p">
                  Content for the first section with multiple paragraphs.
                </Text>
              </Box>
              <Box>
                <Text weight="bold">Section 2</Text>
                <Text as="p">More content demonstrating the animation.</Text>
              </Box>
              <Box>
                <Text weight="bold">Section 3</Text>
                <Text as="p">
                  Additional content to show smooth transitions.
                </Text>
              </Box>
            </Flex>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <div>
      <Heading size="4" mb="3">
        Multiple Items
      </Heading>
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item One</AccordionTrigger>
          <AccordionContent>
            <Text>Content for item one.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item Two</AccordionTrigger>
          <AccordionContent>
            <Text>Content for item two.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Item Three</AccordionTrigger>
          <AccordionContent>
            <Text>Content for item three.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
    <div>
      <Heading size="4" mb="3">
        Chevron Left
      </Heading>
      <CollapsibleList
        chevronPosition="left"
        items={[
          {
            id: 'a',
            title: 'Item A',
            content: <Text>Content for item A</Text>,
          },
          {
            id: 'b',
            title: 'Item B',
            content: <Text>Content for item B</Text>,
            defaultOpen: true,
          },
          {
            id: 'c',
            title: 'Item C',
            content: <Text>Content for item C</Text>,
          },
        ]}
      />
    </div>
  </Flex>
);
