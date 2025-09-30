import { browser } from '$app/environment';

export type Theme = 'papermod' | 'papermod_dark';

const THEME_KEY = 'theme';

class ThemeStore {
	current = $state<Theme>('papermod');

	init() {
		if (!browser) return;

		const stored = localStorage.getItem(THEME_KEY) as Theme | null;
		if (stored) {
			this.current = stored;
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.current = prefersDark ? 'papermod_dark' : 'papermod';
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
		const newTheme: Theme = this.current === 'papermod' ? 'papermod_dark' : 'papermod';
		this.set(newTheme);
	}

	get isDark() {
		return this.current === 'papermod_dark';
	}
}

export const themeStore = new ThemeStore();
