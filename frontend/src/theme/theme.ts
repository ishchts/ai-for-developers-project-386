export const themes = {
  light: "light",
  dark: "dark",
} as const;

export type ThemeName = (typeof themes)[keyof typeof themes];

export const defaultTheme: ThemeName = themes.light;
