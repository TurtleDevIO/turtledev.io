import { browser } from '$app/environment';

export const THEME_LIGHT = 'lemonade' as const;
export const THEME_DARK = 'forest' as const;

export type Theme = typeof THEME_LIGHT | typeof THEME_DARK;

const THEME_KEY = 'theme';

class ThemeStore {
	current = $state<Theme>(THEME_LIGHT);

	init() {
		if (!browser) return;

		const stored = localStorage.getItem(THEME_KEY) as Theme | null;
		if (stored) {
			this.current = stored;
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.current = prefersDark ? THEME_DARK : THEME_LIGHT;
		}
		document.documentElement.setAttribute('data-theme', this.current);
	}

	set(theme: Theme) {
		if (!browser) return;

		this.current = theme;
		localStorage.setItem(THEME_KEY, theme);
		document.documentElement.setAttribute('data-theme', theme);
	}

	toggle() {
		const newTheme: Theme = this.current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
		this.set(newTheme);
	}

	get isDark() {
		return this.current === THEME_DARK;
	}
}

export const themeStore = new ThemeStore();
