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

// 1. MyPreset: Defines only the Color Palette (Semantic Tokens)
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

const INPUT_STYLE = [
  'bg-surface-100 dark:bg-surface-800 disabled:bg-surface-200 dark:disabled:bg-surface-700',
  'text-surface-900 dark:text-surface-0 placeholder:text-surface-400',
  'border border-surface-300 dark:border-surface-600',
  'hover:border-primary-400 focus:border-primary-500',
  'shadow-none rounded-md transition-colors duration-200',
  'filled:bg-primary-100 dark:filled:bg-primary-800',
].join(' ');

export const MyGlobalPT = {
  card: {
    root: {
      class:
        'bg-surface-0 dark:bg-surface-900 rounded-xl shadow-lg text-surface-900 dark:text-surface-0 border-none',
    },
    body: {
      class: 'p-8 gap-3',
    },
    caption: {
      class: 'gap-2',
    },
    title: {
      class: 'text-xl font-bold text-surface-900 dark:text-surface-0',
    },
    subtitle: {
      class: 'text-surface-500 dark:text-surface-400',
    },
  },

  dialog: {
    root: {
      class:
        'bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-2xl text-surface-900 dark:text-surface-0',
    },
    header: {
      class: 'p-6 gap-2 border-b border-surface-100 dark:border-surface-800',
    },
    title: {
      class: 'text-xl font-bold',
    },
    content: {
      class: 'px-6 pb-6 pt-4',
    },
    footer: {
      class: 'p-4 gap-2 border-t border-surface-100 dark:border-surface-800',
    },
  },

  accordion: {
    root: {
      class: 'transition-all duration-200',
    },
    panel: {
      class: 'border-0',
    },
    header: {
      class: [
        'p-[1.125rem] font-semibold rounded-md border border-surface-200 dark:border-surface-700',
        'bg-surface-50 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800',
        'text-surface-900 dark:text-surface-0 transition-colors duration-200', // Fixed contrast
      ].join(' '),
    },
    content: {
      class:
        'border border-t-0 border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 p-[1.125rem]',
    },
    toggleicon: {
      class: 'text-surface-500 dark:text-surface-400',
    },
  },

  divider: {
    root: {
      class: 'border-surface-200 dark:border-surface-700',
    },
    content: {
      class: 'bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 px-2',
    },
    horizontal: {
      class: 'my-4 mx-0 px-4',
    },
    vertical: {
      class: 'mx-4 my-0 py-4',
    },
  },

  inputtext: {
    root: {
      class: `${INPUT_STYLE} px-3 py-3`,
    },
  },
  textarea: {
    root: {
      class: `${INPUT_STYLE} p-3`,
    },
  },
  inputnumber: {
    root: {
      class: 'transition-all duration-200',
    },
    input: {
      class: `${INPUT_STYLE} px-3 py-3`,
    },
    button: {
      class: [
        'w-10 bg-transparent',
        'text-surface-500 dark:text-surface-400',
        'hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-0',
        'border-transparent',
      ].join(' '),
    },
  },
  password: {
    meter: {
      class: 'rounded-sm h-1 bg-surface-200 dark:bg-surface-700',
    },
    icon: {
      class: 'text-surface-500 dark:text-surface-400',
    },
    overlay: {
      class:
        'bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-md shadow-xl p-4',
    },
    content: {
      class: 'gap-2',
    },
  },

  select: {
    root: {
      class: `${INPUT_STYLE} px-4 py-2 flex items-center justify-between !text-surface-700 !dark:text-surface-0`,
    },
    label: {
      class: 'text-surface-900 dark:text-surface-0 font-medium truncate',
    },
    dropdown: {
      class: 'w-fit text-surface-500 dark:text-surface-400',
    },
    overlay: {
      class: [
        'pl-0 m-0 max-h-[200px]',
        'bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-md',
        '[&::-webkit-scrollbar]:w-1.5',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:bg-surface-200',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        'dark:[&::-webkit-scrollbar-thumb]:bg-surface-700',
        '[scrollbar-width:thin]',
        '[scrollbar-color:var(--p-surface-200)_transparent]',
        'dark:[scrollbar-color:var(--p-surface-700)_transparent]',
      ].join(' '),
    },
    list: {
      class: '!p-0 list-none m-0',
    },
    option: {
      class: [
        'text-surface-700 dark:text-surface-0',
        'p-2 rounded-sm cursor-pointer transition-colors duration-200',
        'hover:bg-primary-100 dark:hover:bg-primary-800',
        'aria-selected:bg-primary-100 dark:aria-selected:bg-primary-900/20 aria-selected:text-primary-700 dark:aria-selected:text-primary-400',
      ].join(' '),
    },
  },
  multiselect: {
    root: {
      class: [
        'inline-flex cursor-pointer select-none',
        'bg-surface-0 dark:bg-surface-900',
        'border border-surface-300 dark:border-surface-600',
        'transition-colors duration-200',
        'rounded-md',
        'w-full',
      ].join(' '),
    },
    labelContainer: {
      class: 'overflow-hidden flex flex-auto cursor-pointer',
    },
    label: {
      class: [
        'block overflow-hidden text-ellipsis whitespace-nowrap',
        'cursor-pointer',
        'px-4 py-2',
        'text-surface-900 dark:text-surface-0',
        'transition duration-200',
      ].join(' '),
    },
    trigger: {
      class: [
        'flex items-center justify-center shrink-0',
        'bg-transparent text-surface-500 w-12 rounded-tr-md rounded-br-md',
      ].join(' '),
    },
    panel: {
      class:
        'bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 border-0 rounded-md shadow-xl',
    },
    header: {
      class: [
        'p-3 border-b border-surface-200 dark:border-surface-700',
        'text-surface-700 dark:text-surface-0',
        'bg-surface-50 dark:bg-surface-900',
        'rounded-t-md',
        'flex items-center justify-between',
      ].join(' '),
    },
    headerCheckbox: {
      root: {
        class: 'relative inline-flex align-bottom w-5 h-5 mr-2 cursor-pointer',
      },
      box: {
        class: [
          'flex items-center justify-center',
          'w-5 h-5 rounded-md border-2',
          'transition-colors duration-200',

          '!bg-surface-0 dark:!bg-surface-900',
          '!border-surface-300 dark:!border-surface-700',

          'hover:!border-primary-500',

          '[&[data-p-checked="true"]]:!border-primary-500',
          '[&[data-p-checked="true"]]:!bg-primary-500',
        ].join(' '),
      },
      icon: {
        class: 'text-white text-base font-bold',
      },
    },
    listContainer: {
      class: [
        'max-h-[200px] overflow-auto',
        'bg-surface-0 dark:bg-surface-900',
        '[&::-webkit-scrollbar]:w-1.5',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:bg-surface-200',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        'dark:[&::-webkit-scrollbar-thumb]:bg-surface-700',
        '[scrollbar-width:thin]',
        '[scrollbar-color:var(--p-surface-200)_transparent]',
        'dark:[scrollbar-color:var(--p-surface-700)_transparent]',
      ].join(' '),
    },
    list: {
      class: 'py-2 list-none m-0',
    },
    item: {
      class: [
        'cursor-pointer font-normal overflow-hidden relative whitespace-nowrap',
        'm-0 p-2 border-0 transition-shadow duration-200 rounded-none',

        'text-surface-900 dark:text-surface-0',

        'hover:!bg-primary-50 dark:hover:!bg-primary-900/30',
        'hover:!text-surface-900 dark:hover:!text-surface-0',

        'outline-none',
        'data-[p-focused="true"]:!bg-primary-50 dark:data-[p-focused="true"]:!bg-primary-900/30',
        'data-[p-focused="true"]:!text-surface-900 dark:data-[p-focused="true"]:!text-surface-0',

        'aria-selected:!bg-primary-100 dark:aria-selected:!bg-primary-900/10',
        'aria-selected:!text-surface-900 dark:aria-selected:!text-primary-400',
      ].join(' '),
    },
    itemCheckbox: {
      root: {
        class: 'relative inline-flex align-bottom w-5 h-5 mr-2 cursor-pointer',
      },
      box: {
        class: [
          'flex items-center justify-center',
          'w-5 h-5 rounded-md border-2',
          'transition-colors duration-200',

          '!bg-surface-0 dark:!bg-surface-900',
          '!border-surface-300 dark:!border-surface-700',

          'hover:!border-primary-500',

          '[&[data-p-checked="true"]]:!border-primary-500',
          '[&[data-p-checked="true"]]:!bg-primary-500',
        ].join(' '),
      },
      icon: {
        class: 'text-white text-base font-bold',
      },
    },
    chip: {
      class: 'rounded-sm',
    },
  },
  datepicker: {
    root: {
      class: ['relative inline-flex'].join(' '),
    },
    panel: {
      class:
        'bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-md shadow-xl',
    },
    header: {
      class: [
        'bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-0 p-2 flex items-center justify-between',
        '[&_button.p-datepicker-prev-button]:!bg-primary-500 [&_button.p-datepicker-prev-button]:!text-white [&_button.p-datepicker-prev-button]:hover:!bg-primary-600',
        '[&_button.p-datepicker-prev-button]:!gap-0 [&_button.p-datepicker-prev-button]:!p-0',
        '[&_button.p-datepicker-next-button]:!gap-0 [&_button.p-datepicker-next-button]:!p-0',
        '[&_button.p-datepicker-next-button]:!bg-primary-500 [&_button.p-datepicker-next-button]:!text-white [&_button.p-datepicker-next-button]:hover:!bg-primary-600',
      ].join(' '),
    },
    title: {
      class: 'gap-2 font-semibold text-surface-900 dark:text-surface-0',
    },
    selectMonth: {
      class:
        'text-surface-700 dark:text-surface-0 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 px-2 py-1 rounded-sm transition-colors cursor-pointer',
    },
    selectYear: {
      class:
        'text-surface-700 dark:text-surface-0 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 px-2 py-1 rounded-sm transition-colors cursor-pointer',
    },
    weekday: {
      class: 'p-2 font-semibold text-surface-500 dark:text-surface-400',
    },
    day: {
      class: [
        'p-2 transition-colors cursor-pointer rounded-full',

        'text-surface-900 dark:text-surface-0',

        'hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700',

        'aria-selected:bg-primary-500 aria-selected:!text-white',

        'aria-[current="date"]:bg-surface-200 aria-[current="date"]:text-surface-900',
        'dark:aria-[current="date"]:bg-surface-700 dark:aria-[current="date"]:text-white',
      ].join(' '),
    },
    monthView: {
      class: 'p-2',
    },
    month: {
      class: [
        'w-1/3 inline-flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors',
        'text-surface-900 dark:text-surface-0',
        'hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700',
        'aria-selected:bg-primary-500 aria-selected:!text-white',
      ].join(' '),
    },
    yearView: {
      class: 'p-2',
    },
    year: {
      class: [
        'w-1/2 inline-flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors',
        'text-surface-900 dark:text-surface-0',
        'hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700',
        'aria-selected:bg-primary-500 aria-selected:!text-white',
      ].join(' '),
    },
    inputicon: {
      class: 'text-white',
    },
  },

  toggleswitch: {
    root: {
      class: [
        'inline-flex items-center',
        'rounded-full transition-colors duration-200',
        'bg-surface-200 dark:bg-surface-700',
        'has-[.p-toggleswitch-checked]:bg-primary-500',
        'cursor-pointer',
      ].join(' '),
    },
    handle: {
      class: ['rounded-full bg-white shadow-sm text-surface-500'].join(' '),
    },
  },
  button: {
    root: {
      class: [
        'text-surface-0 dark:text-surface-900',
        'rounded-md px-4 py-3 gap-2',
        'shadow-sm hover:shadow-md',
        'transition-all duration-200',
        'font-semibold',
      ].join(' '),
    },
    label: {
      class: 'font-semibold inline-flex items-center gap-2',
    },
  },
  splitbutton: {
    root: {
      class: 'rounded-md shadow-sm',
    },
  },
  datatable: {
    root: {
      class:
        'rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 transition-all duration-200',
    },
    header: {
      class: [
        'border-b border-surface-200 dark:border-surface-700',
        'p-4 font-bold',
        '!bg-surface-50 dark:!bg-surface-900',
        '!text-surface-900 dark:!text-surface-0',
      ].join(' '),
    },
    thead: {
      class: '!bg-surface-50 dark:!bg-surface-900',
    },
    headercell: {
      class: [
        'font-semibold',
        'border-b border-surface-200 dark:border-surface-700',
        'p-3 gap-2',
        'text-left',
        'transition-colors duration-200',

        '!bg-surface-50 dark:!bg-surface-900',
        '!text-surface-900 dark:!text-surface-0',

        'hover:!bg-surface-100 dark:hover:!bg-surface-800',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500',
      ].join(' '),
    },
    row: {
      class: [
        'transition-colors duration-200',
        'cursor-pointer',

        '!text-surface-700 dark:!text-surface-0',

        'odd:!bg-surface-0 dark:odd:!bg-surface-900',
        'even:!bg-surface-50 dark:even:!bg-surface-800',

        'hover:!bg-primary-50 dark:hover:!bg-primary-900/30',
        'hover:!text-surface-900 dark:hover:!text-surface-0',

        '[&.p-highlight]:!bg-primary-100 dark:[&.p-highlight]:!bg-primary-900/10',
        '[&.p-highlight]:!text-surface-900 dark:[&.p-highlight]:!text-primary-400',
      ].join(' '),
    },
    bodycell: {
      class: 'p-3 border-b border-surface-200 dark:border-surface-700',
    },
    footer: {
      class: [
        'border-t border-surface-200 dark:border-surface-700',
        'p-3',
        '!bg-surface-50 dark:!bg-surface-900',
        '!text-surface-700 dark:!text-surface-0',
      ].join(' '),
    },
    sorticon: {
      class: 'text-surface-500 dark:text-surface-400 size-3.5 ml-2 transition-colors duration-200',
    },
    paginator: {
      root: {
        class: [
          'flex items-center justify-center flex-wrap',
          'border-t border-surface-200 dark:border-surface-700',
          'px-4 py-2',
          '!bg-surface-0 dark:!bg-surface-900',
          '!text-surface-500 dark:!text-surface-400',
        ].join(' '),
      },
      current: {
        class: 'h-8 leading-8 text-center px-2',
      },
      firstPageButton: {
        class: [
          'h-8 w-8 rounded-full inline-flex items-center justify-center',
          'hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0',
          'text-surface-500 dark:text-surface-400',
          'transition duration-200',
        ].join(' '),
      },
      prevPageButton: {
        class: [
          'h-8 w-8 rounded-full inline-flex items-center justify-center',
          'hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0',
          'text-surface-500 dark:text-surface-400',
          'transition duration-200',
        ].join(' '),
      },
      nextPageButton: {
        class: [
          'h-8 w-8 rounded-full inline-flex items-center justify-center',
          'hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0',
          'text-surface-500 dark:text-surface-400',
          'transition duration-200',
        ].join(' '),
      },
      lastPageButton: {
        class: [
          'h-8 w-8 rounded-full inline-flex items-center justify-center',
          'hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0',
          'text-surface-500 dark:text-surface-400',
          'transition duration-200',
        ].join(' '),
      },
      pageButton: {
        class: [
          'h-8 w-8 rounded-full inline-flex items-center justify-center',
          'text-surface-500 dark:text-surface-400',
          'hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0',
          'transition duration-200',
          '[&.p-highlight]:!bg-primary-500 [&.p-highlight]:!text-white',
        ].join(' '),
      },
    },
  },
  tag: {
    root: {
      class:
        'text-xs font-bold px-2 py-1 gap-1 rounded-md text-primary-700 bg-primary-100 dark:bg-primary-300',
    },
    icon: {
      class: 'text-xs',
    },
  },
  chip: {
    root: {
      class:
        'rounded-xl px-3 py-2 gap-2 bg-primary-100 dark:bg-primary-800 text-surface-700 dark:text-surface-0',
    },
    icon: {
      class: 'text-base text-surface-500 dark:text-surface-400',
    },
    removeIcon: {
      class:
        'text-base text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-0',
    },
  },
  toast: {
    root: {
      class:
        'w-[25rem] rounded-lg shadow-lg opacity-95 bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0',
    },
    content: {
      class: 'p-4 gap-2',
    },
    icon: {
      class: 'text-lg',
    },
    summary: {
      class: 'font-bold text-base',
    },
    detail: {
      class: 'font-medium text-sm',
    },
    closeButton: {
      class: 'w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
    },
  },
  tooltip: {
    root: {
      class:
        'max-w-[12.5rem] p-2 rounded-md bg-surface-900 dark:bg-surface-0 text-surface-0 dark:text-surface-900 shadow-md text-sm',
    },
  },
  floatlabel: {
    root: {
      class: [
        'text-surface-500 dark:text-surface-400',
        'focus-within:text-primary-500',
        'invalid:text-red-500',
        'transition-all duration-200',
        '[&>label]:bg-surface-0 [&>label]:dark:bg-surface-900 [&>label]:px-2',
      ].join(' '),
    },
  },
};
