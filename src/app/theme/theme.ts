import { Injectable, signal, effect, computed } from '@angular/core';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

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
    const stored = localStorage.getItem('talentos:theme');
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

    localStorage.setItem('talentos:theme', isDark ? 'dark' : 'light');
  }
}

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
  },
});
