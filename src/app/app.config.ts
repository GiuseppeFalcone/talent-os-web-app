import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

const EasyCVAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e',
    },
    accent: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    info: {
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
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#0a0f16',
    },
  },
  shape: {
    borderRadius: {
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '18px',
      full: '9999px',
    },
  },
  elevation: {
    0: 'none',
    1: '0 1px 2px 0 rgba(0,0,0,0.40)',
    2: '0 2px 4px -1px rgba(0,0,0,0.45),0 1px 2px 0 rgba(0,0,0,0.35)',
    3: '0 4px 6px -1px rgba(0,0,0,0.5),0 2px 4px -1px rgba(0,0,0,0.4)',
    4: '0 8px 12px -2px rgba(0,0,0,0.55),0 4px 6px -2px rgba(0,0,0,0.45)',
    overlay: '0 12px 24px -4px rgba(0,0,0,0.65)',
  },
  state: {
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.500}',
      offset: '2px',
      borderRadius: '{shape.borderRadius.md}',
    },
    disabledOpacity: '0.38',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
  },
  typography: {
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
    sizes: {
      xs: '0.70rem',
      sm: '0.78rem',
      md: '0.875rem',
      lg: '1rem',
      xl: '1.125rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      sm: '1.15',
      md: '1.3',
      lg: '1.45',
    },
  },
  surface: {
    background: '#0d0f14',
    card: 'rgba(24,26,32,0.85)',
    overlay: 'rgba(12,14,20,0.78)',
    borderColor: 'rgba(255,255,255,0.08)',
    dividerColor: 'rgba(255,255,255,0.06)',
  },
  misc: {
    focusOutline: '0 0 0 3px rgba(217,70,239,0.35)',
    selectionBg: '{primary.600}',
    selectionColor: '#ffffff',
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: EasyCVAura,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
          darkModeSelector: 'html.dark',
        },
      },
    }),
  ],
};
