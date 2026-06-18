"use client";

import { useThemeStore } from "@/lib/stores/theme.store";
import { paletteNames } from "@/lib/theme/palettes";
import type { PaletteName } from "@/lib/theme/types";

export function ThemeSwitcher() {
  const { palette, mode, setPalette, toggleMode } = useThemeStore();

  const cyclePalette = () => {
    const currentIndex = paletteNames.indexOf(palette as PaletteName);
    const nextIndex = (currentIndex + 1) % paletteNames.length;
    setPalette(paletteNames[nextIndex]);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cyclePalette}
        className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
        title="Cycle color palette"
      >
        {palette}
      </button>
      <button
        onClick={toggleMode}
        className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
        title="Toggle dark/light mode"
      >
        {mode === "light" ? "Dark" : "Light"}
      </button>
    </div>
  );
}
