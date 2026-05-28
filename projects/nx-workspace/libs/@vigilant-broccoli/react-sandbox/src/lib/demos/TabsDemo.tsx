import { Text } from '@radix-ui/themes';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';

const TAB = {
  ACCOUNT: 'account',
  PASSWORD: 'password',
  SETTINGS: 'settings',
} as const;

export const TabsDemo = () => (
  <Tabs defaultValue={TAB.ACCOUNT}>
    <TabsList>
      <TabsTrigger value={TAB.ACCOUNT}>Account</TabsTrigger>
      <TabsTrigger value={TAB.PASSWORD}>Password</TabsTrigger>
      <TabsTrigger value={TAB.SETTINGS}>Settings</TabsTrigger>
    </TabsList>
    <TabsContent value={TAB.ACCOUNT}>
      <Text size="2" color="gray">
        Manage your account details and preferences.
      </Text>
    </TabsContent>
    <TabsContent value={TAB.PASSWORD}>
      <Text size="2" color="gray">
        Change your password and security settings.
      </Text>
    </TabsContent>
    <TabsContent value={TAB.SETTINGS}>
      <Text size="2" color="gray">
        Configure application settings and notifications.
      </Text>
    </TabsContent>
  </Tabs>
);
