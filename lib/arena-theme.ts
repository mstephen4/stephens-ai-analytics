export type ArenaTheme = "dark" | "light";

export function isArenaTheme(value: string | undefined): value is ArenaTheme {
  return value === "dark" || value === "light";
}
