import { palettes } from "./palettes";
import type { PaletteName, ThemeMode } from "./types";

export function applyTheme(paletteName: PaletteName, mode: ThemeMode): void {
  const root = document.documentElement;
  const palette = palettes[paletteName]?.[mode];

  if (!palette) return;

  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(`--${key}`, value);
  }

  root.classList.toggle("dark", mode === "dark");
}
