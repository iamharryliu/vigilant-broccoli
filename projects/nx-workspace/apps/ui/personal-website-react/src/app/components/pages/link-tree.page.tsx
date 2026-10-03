import {
  Globe,
  Calendar,
  File,
  Film,
  Github,
  Linkedin,
  Instagram,
  Mail,
  MessageSquare,
  Music,
  BookOpen,
  ShoppingBag,
  Tv,
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

type LinkTreeSection = {
  heading: string;
  items: LinkTreeItem[];
};

const LINK_TREE_SECTIONS: LinkTreeSection[] = [
  {
    heading: 'Personal',
    items: [
      {
        text: 'harryliu.dev',
        url: LINKS.INDEX_PAGE.url.external!,
        icon: Globe,
      },
      {
        text: 'Calendar',
        url: LINKS.CALENDAR_PAGE.url.external!,
        icon: Calendar,
      },
      {
        text: 'Personal Instagram',
        url: LINKS.PERSONAL_INSTAGRAM.url.external!,
        icon: Instagram,
      },
    ],
  },
  {
    heading: 'Contact',
    items: [
      {
        text: 'Contact',
        url: LINKS.CONTACT_PAGE.url.external!,
        icon: MessageSquare,
      },
      {
        text: 'Email',
        url: LINKS.EMAIL.url.external!,
        icon: Mail,
      },
    ],
  },
  {
    heading: 'Career',
    items: [
      { text: 'Resume', url: LINKS.RESUME.url.external!, icon: File },
      {
        text: 'LinkedIn',
        url: LINKS.LINKEDIN.url.external!,
        icon: Linkedin,
      },
    ],
  },
  {
    heading: 'Software',
    items: [
      {
        text: 'GitHub',
        url: LINKS.GITHUB.url.external!,
        icon: Github,
      },
      {
        text: 'Software Projects',
        url: LINKS.SOFTWARE_PROJECTS.url.external!,
        icon: Globe,
      },
    ],
  },
  {
    heading: 'Business',
    items: [
      {
        text: LINKS.SECONDHAND_STORE_IG.text,
        url: LINKS.SECONDHAND_STORE_IG.url.external!,
        icon: ShoppingBag,
      },
    ],
  },
  {
    heading: 'Community',
    items: [
      {
        text: 'Cloud 8 Skate',
        url: LINKS.CLOUD8SKATE.url.external!,
        icon: Globe,
      },
      {
        text: 'Cloud 8 Skate Instagram',
        url: LINKS.CLOUD8SKATE_IG.url.external!,
        icon: Instagram,
      },
      {
        text: 'Toronto City Skate',
        url: LINKS.SKATE_IG.url.external!,
        icon: Instagram,
      },
      {
        text: 'Malmö Urban Skate',
        url: LINKS.MALMOURBANSKATE_IG.url.external!,
        icon: Instagram,
      },
      {
        text: 'Hustle Malmö',
        url: LINKS.HUSTLEMALMO_IG.url.external!,
        icon: Instagram,
      },
    ],
  },
  {
    heading: 'Interests and Hobbies',
    items: [
      {
        text: LINKS.SPOTIFY.text,
        url: LINKS.SPOTIFY.url.external!,
        icon: Music,
      },
      {
        text: LINKS.GOODREADS.text,
        url: LINKS.GOODREADS.url.external!,
        icon: BookOpen,
      },
      {
        text: LINKS.MYANIMELIST.text,
        url: LINKS.MYANIMELIST.url.external!,
        icon: Tv,
      },
      {
        text: LINKS.IMDB.text,
        url: LINKS.IMDB.url.external!,
        icon: Film,
      },
    ],
  },
];

export function LinkTreePage() {
  return (
    <div className="min-h-screen">
      <CenteredAppLayout>
        <div className="pt-8 mb-8">
          <ProfileCard />
        </div>
        <div className="space-y-6 mb-8 max-w-sm mx-auto px-4">
          {LINK_TREE_SECTIONS.map(section => (
            <div key={section.heading}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-1">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.items.map(link => (
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
            </div>
          ))}
        </div>
      </CenteredAppLayout>
    </div>
  );
}
