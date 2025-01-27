import { Component } from '@angular/core';
import { ThemeService } from './theme-service/theme.service';

@Component({
  standalone: true,
  selector: 'app-toggle-dark-mode-button',
  templateUrl: './toggle-dark-mode-button.component.html',
})
export class ToggleDarkThemeButtonComponent {
  constructor(private themeService: ThemeService) {}
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
