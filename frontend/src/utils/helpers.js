export const fmt = (n, d = 2) => (n ?? 0).toFixed(d);
export const pct = (n) => `${fmt(n, 1)}%`;
export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
