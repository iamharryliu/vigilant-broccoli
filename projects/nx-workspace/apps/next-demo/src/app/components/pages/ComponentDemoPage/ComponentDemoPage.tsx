import { ButtonDemo } from './demo/ButtonDemo';
import { CRUDListManagementDemo } from './demo/CRUDListManagementDemo';
import { ErrorDemo } from './demo/ErrorDemo';
import { SelectDemo } from './demo/SelectDemo';

export const ComponentDemoPage = () => {
  return (
    <>
      <ButtonDemo />
      <SelectDemo />
      <CRUDListManagementDemo />
      <ErrorDemo/>
    </>
  );
};
