import { usePathname } from 'next/navigation';
import { TabNav } from '@radix-ui/themes';
import Link from 'next/link';
import { ReactNode } from 'react';

export type NextNavRoute = {
  path: string;
  title: string;
};

export const NextNavBar = ({
  routes,
  rightContent,
}: {
  routes: NextNavRoute[];
  rightContent?: ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <div className="mb-8 relative">
      <TabNav.Root>
        {routes.map(obj => {
          return (
            <TabNav.Link asChild active={pathname === obj.path} key={obj.path}>
              <Link href={obj.path}>{obj.title}</Link>
            </TabNav.Link>
          );
        })}
      </TabNav.Root>
      {rightContent && (
        <div className="absolute right-0 top-0 flex items-center h-full">
          {rightContent}
        </div>
      )}
    </div>
  );
};
