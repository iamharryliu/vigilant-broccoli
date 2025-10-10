import { Component, inject } from '@angular/core';
import { ThemeService } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-toggle-dark-mode-button',
  templateUrl: './toggle-dark-mode-button.component.html',
})
export class ToggleDarkThemeButtonComponent {
  private themeService = inject(ThemeService);
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
