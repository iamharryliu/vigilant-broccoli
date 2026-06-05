'use client';

import { Button, CardContainer } from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';

const SYNC_ENDPOINT = '/api/sync';
const SUCCESS_SYNC = 'Sync complete';

const PAGE_CONTAINER = 'max-w-3xl mx-auto p-8 space-y-6';

export default function SyncPage() {
  const sync = async () => {
    await fetch(SYNC_ENDPOINT);
    alert(SUCCESS_SYNC);
  };

  return (
    <div className={PAGE_CONTAINER}>
      <Text size="6" weight="bold">
        Sync
      </Text>
      <CardContainer title="Sync data">
        <Text size="2" color="gray">
          Refreshes the employee roster from upstream sources.
        </Text>
        <div>
          <Button onClick={sync}>Sync Data</Button>
        </div>
      </CardContainer>
    </div>
  );
}
