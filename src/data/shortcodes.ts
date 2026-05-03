/**
 * Shortcode parser for inline icons in priority text.
 *
 * Rule strings carry icons as `:icon-name:` shortcodes:
 *
 *   "Nearest enemy in :front-arc:"
 *   ":boost: or :barrelroll: to avoid arc"
 *
 * Keys are kebab-case, declared in `icons.ts`. The shape `:[a-z][a-z0-9-]*:`
 * is strict on purpose — it's unambiguous against bare colons in prose
 * (e.g. "Spend 1 token: …" is not parsed as a shortcode).
 */

export const SHORTCODE_RE = /:([a-z][a-z0-9-]*):/g;

export type RulePart = { kind: 'text'; text: string } | { kind: 'icon'; key: string };

export function parseRule(text: string): RulePart[] {
  const parts: RulePart[] = [];
  let last = 0;
  for (const match of text.matchAll(SHORTCODE_RE)) {
    const start = match.index;
    if (start > last) {
      parts.push({ kind: 'text', text: text.slice(last, start) });
    }
    parts.push({ kind: 'icon', key: match[1]! });
    last = start + match[0].length;
  }
  if (last < text.length) {
    parts.push({ kind: 'text', text: text.slice(last) });
  }
  return parts;
}

export function extractShortcodes(text: string): string[] {
  return Array.from(text.matchAll(SHORTCODE_RE), (m) => m[1]!);
}
