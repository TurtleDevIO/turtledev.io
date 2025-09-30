import { browser } from '$app/environment';

export type Theme = 'papermod' | 'papermod_dark';

const THEME_KEY = 'theme';

/**
 * Get the current theme from localStorage or system preference
 */
export function getTheme(): Theme {
	if (!browser) return 'papermod';

	const stored = localStorage.getItem(THEME_KEY) as Theme | null;
	if (stored) return stored;

	// Check system preference
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'papermod_dark' : 'papermod';
}

/**
 * Set the theme and persist to localStorage
 */
export function setTheme(theme: Theme) {
	if (!browser) return;

	console.log('setTheme called with:', theme);
	localStorage.setItem(THEME_KEY, theme);
	document.documentElement.setAttribute('data-theme', theme);
	console.log('Theme set to:', document.documentElement.getAttribute('data-theme'));
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): Theme {
	const current = getTheme();
	console.log('toggleTheme - current theme:', current);
	const newTheme: Theme = current === 'papermod' ? 'papermod_dark' : 'papermod';
	console.log('toggleTheme - new theme:', newTheme);
	setTheme(newTheme);
	return newTheme;
}

/**
 * Check if current theme is dark
 */
export function isDarkTheme(theme: Theme): boolean {
	return theme === 'papermod_dark';
}
