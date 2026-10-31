// "#4FD8EB" -> "79 216 235" (the format Tailwind's rgb(var(--x) / alpha) needs)
export function hexToChannels(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
