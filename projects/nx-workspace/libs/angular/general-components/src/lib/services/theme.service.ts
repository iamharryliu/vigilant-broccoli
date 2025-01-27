import { Injectable } from '@angular/core';

const THEME_KEY = 'DARK_MODE';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    this.loadTheme();
  }

  toggleDarkMode(): void {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, isDarkMode.toString());
  }

  private loadTheme(): void {
    const isDarkMode = localStorage.getItem(THEME_KEY) === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }
}
