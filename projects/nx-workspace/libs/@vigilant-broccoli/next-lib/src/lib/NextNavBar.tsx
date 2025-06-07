import { usePathname } from 'next/navigation';
import { TabNav } from '@radix-ui/themes';
import Link from 'next/link';

export type NextNavRoute = {
  path: string;
  title: string;
};

export const NextNavBar = ({ routes }: { routes: NextNavRoute[] }) => {
  const pathname = usePathname();
  return (
    <div className="mb-8">
      <TabNav.Root>
        {routes.map(obj => {
          return (
            <TabNav.Link asChild active={pathname === obj.path} key={obj.path}>
              <Link href={obj.path}>{obj.title}</Link>
            </TabNav.Link>
          );
        })}
      </TabNav.Root>
    </div>
  );
};
