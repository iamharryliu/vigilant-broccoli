import { Text, Badge } from '@radix-ui/themes';
import {
  Button,
  MonospaceText,
  StatusCardList,
  BORDER_ACTIVE,
} from '@vigilant-broccoli/react-lib';
import { TrashIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

export const StatusCardListDemo = () => (
  <div className="flex flex-col gap-5">
    <div>
      <Text size="2" weight="bold" mb="2">
        Flat items
      </Text>
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
    </div>

    <div>
      <Text size="2" weight="bold" mb="2">
        Collapsible items
      </Text>
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
    </div>

    <div>
      <Text size="2" weight="bold" mb="2">
        Empty state
      </Text>
      <StatusCardList items={[]} emptyMessage="No services found" />
    </div>
  </div>
);
