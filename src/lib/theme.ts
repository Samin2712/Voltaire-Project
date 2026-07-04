export const THEME_STORAGE_KEY = "voltaire-theme-v2";
export const THEME_CHANGED_EVENT = "voltaire-theme-change";

export type ThemeName = "light" | "dark";

export function getStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme: ThemeName) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
  applyTheme(theme);
}

export function notifyThemeChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
  }
}
