import { computed, effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'easycv:theme';
  readonly dark = signal<boolean>(false);
  readonly modeLabel = computed(() => (this.dark() ? 'Light' : 'Dark'));
  readonly modeIcon = computed(() => (this.dark() ? 'pi pi-sun' : 'pi pi-moon'));

  constructor() {
    const saved = (localStorage.getItem(this.storageKey) || '').toLowerCase();
    const prefers = matchMedia('(prefers-color-scheme: dark)').matches;
    this.dark.set(saved === 'dark' ? true : saved === 'light' ? false : prefers);

    effect(() => {
      const isDark = this.dark();
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.dark.update((v) => !v);
  }
}
