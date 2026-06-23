import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {
  useCurrentSidebarCategory,
  useDocById,
} from '@docusaurus/plugin-content-docs/client';

/**
 * Renders a chapter's lesson list straight from the sidebar, so the numbering
 * and contents can never drift from the source of truth (sidebars.ts).
 *
 * Use it on a chapter *overview* page (the doc that a sidebar category links to)
 * by dropping <ChapterContents /> into the MDX. It walks the current category:
 * each sub-category becomes an <h3>; every doc becomes a numbered <li> showing
 * the doc's title and frontmatter description. Numbering is continuous across
 * groups, derived from position — never hand-maintained.
 */

type DocRow = {
  href: string;
  label: string;
  docId?: string;
  number: number;
  // The nearest enclosing sub-category, or null for docs that sit directly under
  // the chapter (e.g. an intro on-ramp at the top, or a checkpoint at the bottom).
  groupLabel: string | null;
};

function buildRows(
  items: any[],
  rows: DocRow[],
  counter: {n: number},
  groupLabel: string | null,
): void {
  for (const item of items) {
    if (item.type === 'category') {
      buildRows(item.items ?? [], rows, counter, item.label);
    } else if (item.type === 'link' && item.href) {
      counter.n += 1;
      rows.push({
        href: item.href,
        label: item.label,
        docId: item.docId,
        number: counter.n,
        groupLabel,
      });
    }
  }
}

function DocItem({
  href,
  label,
  docId,
}: {
  href: string;
  label: string;
  docId?: string;
}): ReactNode {
  // useDocById accepts undefined and returns undefined — one hook per item,
  // so this satisfies the rules of hooks even inside the list.
  const doc = useDocById(docId);
  const title = doc?.title ?? label;
  const description = doc?.description;
  return (
    <li>
      <Link to={href}>{title}</Link>
      {description ? ` — ${description}` : null}
    </li>
  );
}

export default function ChapterContents(): ReactNode {
  const category = useCurrentSidebarCategory();
  const rows: DocRow[] = [];
  buildRows((category.items as any[]) ?? [], rows, {n: 0}, null);

  // Render consecutive docs that share an enclosing category as one numbered
  // list under that category's heading. Docs directly under the chapter render
  // as a headerless list, so an intro page or a checkpoint doesn't get swept
  // under the previous category's heading.
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < rows.length) {
    const groupLabel = rows[i].groupLabel;
    const chunk: DocRow[] = [];
    while (i < rows.length && rows[i].groupLabel === groupLabel) {
      chunk.push(rows[i]);
      i += 1;
    }
    if (groupLabel != null) {
      blocks.push(<h3 key={key++}>{groupLabel}</h3>);
    }
    blocks.push(
      <ol key={key++} start={chunk[0].number}>
        {chunk.map((d) => (
          <DocItem key={d.href} href={d.href} label={d.label} docId={d.docId} />
        ))}
      </ol>,
    );
  }

  return <>{blocks}</>;
}
