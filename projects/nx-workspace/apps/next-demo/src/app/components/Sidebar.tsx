'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { NAV_LINKS } from '../app.consts';
import { ROUTES } from '../../lib/routes';

type FlatPage = { label: string; href: string };

const ALL_PAGES: FlatPage[] = NAV_LINKS.flatMap(
  ({ label, href, children }): FlatPage[] =>
    children
      ? [
          { label, href },
          ...children.map(c => ({ label: c.label, href: c.href as string })),
        ]
      : [{ label, href: href as string }],
);

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? ALL_PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
    : null;

  return (
    <aside
      className="group/sidebar fixed top-0 left-0 bottom-0 z-30 w-14 hover:w-48 border-r border-gray-200 bg-white flex flex-col overflow-hidden transition-all duration-200"
      onMouseLeave={() => {
        setOpen(null);
        setQuery('');
      }}
    >
      <div className="flex items-center justify-center group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:px-3 h-[49px] border-b border-gray-200 shrink-0">
        <Link href={ROUTES.HOME} className="shrink-0 w-[18px] h-[18px] rounded-sm bg-black" />
        <span className="w-0 group-hover/sidebar:w-auto overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 font-semibold text-sm whitespace-nowrap">
          next-demo
        </span>
      </div>

      <div className="flex flex-col gap-1 px-2 group-hover/sidebar:px-3 py-4 overflow-y-auto overflow-x-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-500 hover:text-black hover:bg-gray-50">
          <span className="shrink-0">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 w-full text-sm bg-transparent outline-none placeholder-gray-400"
          />
        </div>

        {results ? (
          results.length > 0 ? (
            results.map(page => (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setQuery('')}
                className={`text-sm px-3 py-1.5 rounded-md whitespace-nowrap ${pathname.startsWith(page.href) ? 'font-medium text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
              >
                {page.label}
              </Link>
            ))
          ) : (
            <span className="text-xs text-gray-400 px-3 py-2">No results</span>
          )
        ) : (
          NAV_LINKS.map(({ label, href, icon: Icon, children }) => {
            const isActive = pathname.startsWith(href);
            const isOpen = open === href;
            const childActive =
              children?.some(c => pathname.startsWith(c.href)) ?? false;
            const highlight = isActive || childActive;
            const baseClass = `text-sm rounded-md transition-colors ${highlight ? 'font-medium text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`;

            if (children) {
              return (
                <div key={href}>
                  <button
                    onClick={() => setOpen(isOpen ? null : href)}
                    className={`w-full flex items-center gap-3 px-2 py-2 ${baseClass}`}
                  >
                    <span className="shrink-0">
                      <Icon size={18} />
                    </span>
                    <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap flex-1 text-left">
                      {label}
                    </span>
                    <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 shrink-0">
                      {isOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-1 mt-1 ml-3 pb-1">
                        {children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`text-sm px-3 py-1.5 rounded-md whitespace-nowrap ${pathname.startsWith(child.href) ? 'font-medium text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-2 py-2 ${baseClass}`}
              >
                <span className="shrink-0">
                  <Icon size={18} />
                </span>
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                  {label}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
