import { ICON_CLASS, isIconKey } from '../data/icons';
import { parseRule } from '../data/shortcodes';

interface RuleProps {
  text: string;
}

/**
 * Renders priority text with `:icon-name:` shortcodes replaced by inline
 * icon glyphs. Unresolved shortcodes render in red so dev-time typos are
 * visible immediately; the data validator catches them at build time too.
 */
export function Rule({ text }: RuleProps) {
  const parts = parseRule(text);
  return (
    <>
      {parts.map((part, i) => {
        if (part.kind === 'text') {
          return <span key={i}>{part.text}</span>;
        }
        if (isIconKey(part.key)) {
          return <i key={i} className={ICON_CLASS[part.key]} />;
        }
        return (
          <span key={i} className="red" title={`Unknown icon: :${part.key}:`}>
            :{part.key}:
          </span>
        );
      })}
    </>
  );
}

interface PriorityListProps {
  items: readonly string[];
}

export function PriorityList({ items }: PriorityListProps) {
  return (
    <ol>
      {items.map((text, i) => (
        <li key={i}>
          <Rule text={text} />
        </li>
      ))}
    </ol>
  );
}
