import { CheckboxCardGroup, Text } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { DemoSection } from './DemoSection';

const DAY = {
  MON: 'mon',
  TUE: 'tue',
  WED: 'wed',
  THU: 'thu',
  FRI: 'fri',
} as const;
type Day = (typeof DAY)[keyof typeof DAY];

const DAY_OPTIONS = [
  { value: DAY.MON, label: 'Mon' },
  { value: DAY.TUE, label: 'Tue' },
  { value: DAY.WED, label: 'Wed' },
  { value: DAY.THU, label: 'Thu' },
  { value: DAY.FRI, label: 'Fri' },
];

export const CheckboxCardGroupDemo = () => {
  const [days, setDays] = useState<Day[]>([DAY.MON, DAY.WED]);
  return (
    <DemoSection title="Days">
      <CheckboxCardGroup
        label="Days"
        values={days}
        options={DAY_OPTIONS}
        onChange={setDays}
      />
      <Text size="2" color="gray" role="status">
        Selected: {days.length > 0 ? days.join(', ') : 'none'}
      </Text>
    </DemoSection>
  );
};
