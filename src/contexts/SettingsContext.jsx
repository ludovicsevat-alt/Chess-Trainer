import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { resolveMessages } from "../i18n/messages";
import {
  getVolume,
  isMuted,
  setMuted as setSoundMuted,
  setVolume as setSoundVolume,
} from "../audio/SoundManager";
import {
  DEFAULT_BOARD_THEME,
  getBoardTheme,
} from "../constants/boardThemes";

const storageKey = "chesstrainer.settings";

const defaultSettings = {
  theme: "dark",
  language: "fr",
  highlightLastMove: true,
  animationEnabled: true,
  animationDuration: 300,
  soundMuted: isMuted(),
  soundVolume: getVolume(),
  boardTheme: DEFAULT_BOARD_THEME,
};

const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return { ...defaultSettings };
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    } catch {
      return { ...defaultSettings };
    }
  });

  useEffect(() => {
    setSoundMuted(settings.soundMuted);
  }, [settings.soundMuted]);

  useEffect(() => {
    setSoundVolume(settings.soundVolume);
  }, [settings.soundVolume]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", settings.language);
  }, [settings.language]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    document.body?.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings });
  }, []);

  const messages = useMemo(
    () => resolveMessages(settings.language),
    [settings.language]
  );

  const boardThemeConfig = useMemo(
    () => getBoardTheme(settings.boardTheme),
    [settings.boardTheme]
  );

  const value = useMemo(
    () => ({
      settings,
      messages,
      boardThemeConfig,
      updateSetting,
      resetSettings,
    }),
    [settings, messages, boardThemeConfig, updateSetting, resetSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
