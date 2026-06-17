import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: Theme = 'dark';

  constructor() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    this.setTheme(saved ?? 'dark');
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  toggleTheme(): Theme {
    const next = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  getTheme(): Theme {
    return this.currentTheme;
  }
}
