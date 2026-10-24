import './mock.env';
import { runOfficePresenceMock } from '@vigilant-broccoli/slackbots';

(async () => {
  await runOfficePresenceMock({
    port: process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : undefined,
  });
})();
