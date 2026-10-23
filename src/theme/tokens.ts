export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const fontSize = {
  caption: 13,
  body: 16,
  lead: 18,
  title: 24,
  hero: 30,
} as const;

/** Content never stretches wider than a phone column, even on web. */
export const maxContentWidth = 520;
