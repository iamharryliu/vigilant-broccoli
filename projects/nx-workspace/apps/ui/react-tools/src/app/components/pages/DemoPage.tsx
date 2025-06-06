import { Layout } from '../layout/Layout';
import { ButtonDemo } from '../demo/ButtonDemo';
import { CRUDListManagementDemo } from '../demo/CRUDListManagementDemo';
import { SelectDemo } from '../demo/SelectDemo';

export const ComponentLibraryDemo = () => {
  return (
    <Layout>
      <ButtonDemo />
      <SelectDemo />
      <CRUDListManagementDemo />
    </Layout>
  );
};
