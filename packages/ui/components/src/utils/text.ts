export function truncate(text: string, max = 32): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '\u2026'
}
