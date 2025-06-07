import { ButtonDemo } from './demo/ButtonDemo';
import { CRUDListManagementDemo } from './demo/CRUDListManagementDemo';
import { SelectDemo } from './demo/SelectDemo';

export const ComponentDemoPage = () => {
  return (
    <>
      <ButtonDemo />
      <SelectDemo />
      <CRUDListManagementDemo />
    </>
  );
};
