import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private readonly darkMode = signal<boolean>(this.getInitialTheme());
  readonly modeLabel = computed(() => (this.darkMode() ? 'Light' : 'Dark'));
  readonly modeIcon = computed(() => (this.darkMode() ? 'pi pi-sun' : 'pi pi-moon'));

  constructor() {
    effect(() => {
      this.applyTheme(this.darkMode());
    });
  }

  toggle(): void {
    this.darkMode.update((dark) => !dark);
  }

  isDark(): boolean {
    return this.darkMode();
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
