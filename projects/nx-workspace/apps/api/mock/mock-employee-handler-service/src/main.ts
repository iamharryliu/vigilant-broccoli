import {
  createEmployeeHandlerApp,
  EMPLOYEE_HANDLER_CONFIG_MOCK,
  MOCK_DEFAULT_TEMPLATES,
} from '@vigilant-broccoli/employee-handler';

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const API_KEY = process.env.EMPLOYEE_HANDLER_API_KEY;

const app = createEmployeeHandlerApp(EMPLOYEE_HANDLER_CONFIG_MOCK, {
  apiKey: API_KEY,
  defaultTemplates: MOCK_DEFAULT_TEMPLATES,
});

const start = async () => {
  await app.listen({ port: PORT, host: HOST });
  console.log(`[ ready ] http://${HOST}:${PORT}`);
};

start();
