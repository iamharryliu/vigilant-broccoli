import { Component, HostListener, inject } from '@angular/core';
import { ThemeService } from 'general-components';

const IGNORED_TAG_NAMES = ['INPUT', 'TEXTAREA', 'SELECT'];

@Component({
  standalone: true,
  selector: 'app-toggle-dark-mode-button',
  templateUrl: './toggle-dark-mode-button.component.html',
})
export class ToggleDarkThemeButtonComponent {
  private themeService = inject(ThemeService);

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'd') return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return;
    const target = event.target as HTMLElement;
    if (IGNORED_TAG_NAMES.includes(target.tagName) || target.isContentEditable)
      return;
    this.toggleDarkMode();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
