import { Injectable, computed, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
const STORAGE_KEY = 'camborent_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeValue = signal<ThemeMode>('dark');

  readonly theme = this.themeValue.asReadonly();
  readonly isDark = computed(() => this.themeValue() === 'dark');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const preferred = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.setTheme(preferred, false);
  }

  toggleTheme(): void {
    this.setTheme(this.themeValue() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode, persist = true): void {
    this.themeValue.set(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.classList.toggle('light', theme === 'light');
    }
    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }
}
