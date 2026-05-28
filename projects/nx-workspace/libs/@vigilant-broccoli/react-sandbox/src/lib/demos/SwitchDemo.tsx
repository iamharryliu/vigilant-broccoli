import { Flex } from '@radix-ui/themes';
import { Switch } from '@vigilant-broccoli/react-lib';

export const SwitchDemo = () => (
  <Flex direction="column" gap="3">
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Switch id="default" />
      Default
    </label>
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Switch id="checked" defaultChecked />
      Default checked
    </label>
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Switch id="disabled" disabled />
      Disabled
    </label>
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Switch id="disabled-checked" disabled defaultChecked />
      Disabled (checked)
    </label>
  </Flex>
);
