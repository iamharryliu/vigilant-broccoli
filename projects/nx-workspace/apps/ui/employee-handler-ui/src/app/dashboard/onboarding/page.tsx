'use client';

import { Button, CardContainer } from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';

const ONBOARD_ENDPOINT = '/api/onboard';
const ONBOARD_SUCCESS = 'Onboarded incoming employees';

const PAGE_CONTAINER = 'max-w-3xl mx-auto p-8 space-y-6';

export default function OnboardingPage() {
  const onboard = async () => {
    await fetch(ONBOARD_ENDPOINT);
    alert(ONBOARD_SUCCESS);
  };

  return (
    <div className={PAGE_CONTAINER}>
      <Text size="6" weight="bold">
        Onboarding
      </Text>
      <CardContainer title="Onboard incoming employees">
        <Text size="2" color="gray">
          Provisions accounts for new employees based on the configured roster.
        </Text>
        <div>
          <Button onClick={onboard}>Onboard Incoming Employees</Button>
        </div>
      </CardContainer>
    </div>
  );
}
