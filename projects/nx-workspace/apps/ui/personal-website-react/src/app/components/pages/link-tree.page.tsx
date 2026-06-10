import { CenteredAppLayout } from '../layouts/centered-app-layout';
import { ProfileCard } from '../features/profile-card';
import { LINKS } from '../../core/consts/routes.const';

type LinkTreeItem = {
  text: string;
  url: string;
  icon: string;
};

const LINK_TREE_ITEMS: LinkTreeItem[] = [
  {
    text: 'Personal Website',
    url: LINKS.INDEX_PAGE.url.external!,
    icon: 'fa-solid fa-globe',
  },
  {
    text: 'Calendar',
    url: LINKS.CALENDAR_PAGE.url.external!,
    icon: 'fa-solid fa-calendar',
  },
  { text: 'Resume', url: LINKS.RESUME.url.external!, icon: 'fa-solid fa-file' },
  {
    text: 'GitHub',
    url: LINKS.GITHUB.url.external!,
    icon: 'fa-brands fa-github',
  },
  {
    text: 'LinkedIn',
    url: LINKS.LINKEDIN.url.external!,
    icon: 'fa-brands fa-linkedin',
  },
  {
    text: 'Toronto City Skate',
    url: LINKS.SKATE_IG.url.external!,
    icon: 'fa-brands fa-instagram',
  },
  {
    text: 'Cloud8Skate',
    url: LINKS.CLOUD8SKATE.url.external!,
    icon: 'fa-solid fa-globe',
  },
  {
    text: 'Cloud8Skate Instagram',
    url: LINKS.CLOUD8SKATE_IG.url.external!,
    icon: 'fa-brands fa-instagram',
  },
  {
    text: 'Buy me a coffee?',
    url: LINKS.KOFI.url.external!,
    icon: 'fa-solid fa-mug-hot',
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
                <i className={`${link.icon} w-5 text-lg`} />
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
