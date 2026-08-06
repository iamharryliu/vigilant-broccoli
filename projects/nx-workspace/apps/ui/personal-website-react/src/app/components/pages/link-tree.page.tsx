import {
  Globe,
  Calendar,
  File,
  Github,
  Linkedin,
  Instagram,
  type LucideIcon,
} from 'lucide-react';
import { CenteredAppLayout } from '../layouts/centered-app-layout';
import { ProfileCard } from '../features/profile-card';
import { LINKS } from '../../core/consts/routes.const';

type LinkTreeItem = {
  text: string;
  url: string;
  icon: LucideIcon;
};

const LINK_TREE_ITEMS: LinkTreeItem[] = [
  {
    text: 'Personal Website',
    url: LINKS.INDEX_PAGE.url.external!,
    icon: Globe,
  },
  {
    text: 'Calendar',
    url: LINKS.CALENDAR_PAGE.url.external!,
    icon: Calendar,
  },
  { text: 'Resume', url: LINKS.RESUME.url.external!, icon: File },
  {
    text: 'GitHub',
    url: LINKS.GITHUB.url.external!,
    icon: Github,
  },
  {
    text: 'LinkedIn',
    url: LINKS.LINKEDIN.url.external!,
    icon: Linkedin,
  },
  {
    text: 'Toronto City Skate',
    url: LINKS.SKATE_IG.url.external!,
    icon: Instagram,
  },
  {
    text: 'Cloud8Skate',
    url: LINKS.CLOUD8SKATE.url.external!,
    icon: Globe,
  },
  {
    text: 'Cloud8Skate Instagram',
    url: LINKS.CLOUD8SKATE_IG.url.external!,
    icon: Instagram,
  },
];

export function LinkTreePage() {
  return (
    <div className="min-h-screen">
      <CenteredAppLayout>
        <div className="pt-8 mb-8">
          <ProfileCard />
        </div>
        <div className="space-y-3 mb-8 max-w-sm mx-auto px-4">
          {LINK_TREE_ITEMS.map(link => (
            <div
              key={link.text}
              className="transform transition-all duration-200 hover:scale-105"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="relative flex items-center w-full text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-black dark:hover:bg-gray-800"
              >
                <link.icon size={18} />
                <span className="flex-1 text-center font-bold">
                  {link.text}
                </span>
              </a>
            </div>
          ))}
        </div>
      </CenteredAppLayout>
    </div>
  );
}
