import { LinkCard } from '@vigilant-broccoli/react-lib';
import { GitHubLogoIcon, HomeIcon } from '@radix-ui/react-icons';

export const LinkCardDemo = () => (
  <ul className="grid gap-4">
    <li>
      <LinkCard
        href="#link-card"
        title="Internal link"
        description="Hover to see the card lift slightly and its border and shadow strengthen."
        icon={<HomeIcon />}
      />
    </li>
    <li>
      <LinkCard
        href="https://github.com"
        external
        title="External link"
        description="Opens in a new tab with noopener noreferrer."
        icon={<GitHubLogoIcon />}
      />
    </li>
  </ul>
);
