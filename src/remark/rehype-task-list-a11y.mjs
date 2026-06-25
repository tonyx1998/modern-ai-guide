/**
 * rehype plugin: give Markdown task-list checkboxes an accessible name.
 *
 * remark-gfm renders `- [ ] item` as `<li><input type="checkbox" disabled> item</li>`.
 * The bare disabled input has no label, which pa11y/axe flag under WCAG2AA
 * ("form elements must have labels"). We label each checkbox with its list-item
 * text plus its state, so the control is announced meaningfully.
 *
 * Self-contained (no unist-util-visit dependency) so it resolves cleanly inside
 * the Docusaurus config without adding packages.
 */
function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) return node.children.map(textOf).join('');
  return '';
}

export default function rehypeTaskListA11y() {
  return (tree) => {
    const walk = (node) => {
      if (!Array.isArray(node.children)) return;
      for (const child of node.children) {
        if (
          child.type === 'element' &&
          child.tagName === 'input' &&
          child.properties &&
          child.properties.type === 'checkbox'
        ) {
          // `node` is the enclosing <li>; its text is the item's content.
          const label = textOf(node).trim();
          const state = child.properties.checked ? 'done' : 'to do';
          child.properties.ariaLabel = label
            ? `${state}: ${label}`
            : `checklist item, ${state}`;
        }
        walk(child);
      }
    };
    walk(tree);
  };
}
