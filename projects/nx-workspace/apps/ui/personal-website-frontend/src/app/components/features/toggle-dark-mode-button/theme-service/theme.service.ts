import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'DARK_MODE';

  constructor() {
    this.loadTheme();
  }

  toggleDarkMode(): void {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem(this.THEME_KEY, isDarkMode.toString());
  }

  private loadTheme(): void {
    const isDarkMode = localStorage.getItem(this.THEME_KEY) === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }
}
