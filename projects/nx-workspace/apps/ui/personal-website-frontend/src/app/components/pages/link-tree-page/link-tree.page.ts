import { Component } from '@angular/core';
import { LINKS } from '../../../core/consts/routes.const';
import { CenteredAppLayoutComponent } from '../../layouts/centered-app-layout/centered-app-layout.compoenent';
import { ProfileCardComponent } from '../../features/profile-card/profile-card.component';

interface LinkTreeItem {
  text: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-link-tree-page',
  templateUrl: './link-tree.page.html',
  imports: [CenteredAppLayoutComponent, ProfileCardComponent],
})
export class LinkTreePageComponent {
  links: LinkTreeItem[] = [
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
    {
      text: 'Resume',
      url: LINKS.RESUME.url.external!,
      icon: 'fa-solid fa-file',
    },
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
}
