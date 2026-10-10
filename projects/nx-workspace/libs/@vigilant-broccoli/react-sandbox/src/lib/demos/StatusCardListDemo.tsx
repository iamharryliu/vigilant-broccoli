import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';
import {
  BORDER_ACTIVE,
  Badge,
  Button,
  MonospaceText,
  StatusCardList,
  Text,
} from '@vigilant-broccoli/react-lib';
import { TrashIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

export const StatusCardListDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.STATUS_CARD_LIST.FLAT_ITEMS')}>
        <StatusCardList
          items={[
            { id: '1', label: 'Simple item' },
            { id: '2', label: 'Active item', borderClassName: BORDER_ACTIVE },
            {
              id: '3',
              label: 'With badge',
              badges: (
                <Badge color="blue" size="1">
                  Running
                </Badge>
              ),
            },
            {
              id: '4',
              label: 'With badge and action',
              badges: (
                <Badge color="green" size="1">
                  Active
                </Badge>
              ),
              actions: (
                <Button size="icon" variant="ghost" title="Open">
                  <ExternalLinkIcon />
                </Button>
              ),
            },
          ]}
        />
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.STATUS_CARD_LIST.COLLAPSIBLE_ITEMS')}>
        <StatusCardList
          items={[
            {
              id: 'c1',
              label: 'web-app',
              borderClassName: BORDER_ACTIVE,
              badges: (
                <Badge color="green" size="1">
                  Active
                </Badge>
              ),
              actions: (
                <Button size="icon" variant="ghost" title="Open">
                  <ExternalLinkIcon />
                </Button>
              ),
              children: (
                <div className="flex flex-col gap-1">
                  <Text size="1" color="gray">
                    Domain: web-app.example.com
                  </Text>
                  <MonospaceText text="192.168.1.100" />
                </div>
              ),
            },
            {
              id: 'c2',
              label: 'api-service',
              badges: (
                <Badge color="gray" size="1">
                  Inactive
                </Badge>
              ),
              actions: (
                <Button size="icon" variant="destructive" title="Delete">
                  <TrashIcon />
                </Button>
              ),
              children: (
                <div className="flex flex-col gap-1">
                  <Text size="1" color="gray">
                    Domain: api.example.com
                  </Text>
                  <Text size="1" color="gray">
                    Port: 8080
                  </Text>
                </div>
              ),
            },
          ]}
        />
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.STATUS_CARD_LIST.EMPTY_STATE')}>
        <StatusCardList items={[]} emptyMessage="No services found" />
      </DemoSection>
    </div>
  );
};
