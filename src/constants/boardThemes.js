export const BOARD_THEMES = {
  classic: {
    light: "#f0d9b5",
    dark: "#b58863",
  },
  jade: {
    light: "#dfe7db",
    dark: "#6d8f72",
  },
};

export const DEFAULT_BOARD_THEME = "classic";

export function getBoardTheme(id) {
  return BOARD_THEMES[id] ?? BOARD_THEMES[DEFAULT_BOARD_THEME];
}

