import { Container, TabNav } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_ROUTE } from '../../app.consts';

const NavBar = () => {
  const location = useLocation();
  return (
    <div className="mb-8">
      <TabNav.Root>
        {Object.values(APP_ROUTE).map(obj => {
          return (
            <TabNav.Link
              asChild
              active={location.pathname === obj.path}
              key={obj.path}
            >
              <Link to={obj.path}>{obj.title}</Link>
            </TabNav.Link>
          );
        })}
      </TabNav.Root>
    </div>
  );
};

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Container size="4">
      <NavBar />
      <main className="space-y-4">{children}</main>
    </Container>
  );
};
