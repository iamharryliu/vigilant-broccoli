import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { CollapsibleList, Text } from '@vigilant-broccoli/react-lib';

export const CollapsibleListItemDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection
        title={t('DEMO_SECTION.COLLAPSIBLE_LIST_ITEM.WITH_RICH_CONTENT')}
      >
        <Accordion type="single" collapsible defaultValue="rich">
          <AccordionItem value="rich">
            <AccordionTrigger>Rich Content Example</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <DemoSection
                  title={t('DEMO_SECTION.COLLAPSIBLE_LIST_ITEM.SECTION_1')}
                >
                  <Text as="p">
                    Content for the first section with multiple paragraphs.
                  </Text>
                </DemoSection>
                <DemoSection
                  title={t('DEMO_SECTION.COLLAPSIBLE_LIST_ITEM.SECTION_2')}
                >
                  <Text as="p">More content demonstrating the animation.</Text>
                </DemoSection>
                <DemoSection
                  title={t('DEMO_SECTION.COLLAPSIBLE_LIST_ITEM.SECTION_3')}
                >
                  <Text as="p">
                    Additional content to show smooth transitions.
                  </Text>
                </DemoSection>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DemoSection>

      <DemoSection
        title={t('DEMO_SECTION.COLLAPSIBLE_LIST_ITEM.MULTIPLE_ITEMS')}
      >
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
      </DemoSection>
      <DemoSection title={t('DEMO_SECTION.COLLAPSIBLE_LIST_ITEM.CHEVRON_LEFT')}>
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
      </DemoSection>
    </div>
  );
};
