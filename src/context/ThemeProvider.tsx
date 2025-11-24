import { useLocalStorageValue } from "@react-hookz/web";
import { PrimeReactContext } from "primereact/api";
import type { PropsWithChildren } from "react";
import { createContext, use, useCallback, useEffect, useMemo } from "react";

import { usePrevious } from "../hooks/usePrevious";

const THEME_KEY = "__current_theme__" as const;

type Theme = "light" | "dark";

type PrimeReactContextVal = {
  handleChangeTheme: (theme: Theme) => void;
  theme: Theme;
};

const context = createContext<PrimeReactContextVal | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  /** context */
  const api = use(PrimeReactContext);

  /** hooks */
  const { set: setTheme, value: theme } = useLocalStorageValue<Theme>(
    THEME_KEY,
    { defaultValue: "dark" },
  );

  /** hooks */
  const prevTheme = usePrevious(theme) ?? (theme === "dark" ? "light" : "dark");

  /** callbacks */
  const handleChangeTheme = useCallback<
    PrimeReactContextVal["handleChangeTheme"]
  >((theme) => {
    setTheme(theme);
  }, []);

  /** effects */
  useEffect(() => {
    api.changeTheme?.(prevTheme, theme, "theme-link");
  }, [api, prevTheme, theme]);

  /** provider val */
  const providerVal = useMemo<PrimeReactContextVal>(
    () => ({ handleChangeTheme, theme: theme ?? "dark" }),
    [handleChangeTheme, theme],
  );

  return <context.Provider value={providerVal}>{children}</context.Provider>;
}

export function useThemeContext() {
  const ctx = use(context);
  if (!ctx) {
    throw new Error(
      "unable to usePrimeReactContext() because no <PrimeReactProvider /> was found in the parent tree",
    );
  }

  return ctx;
}
