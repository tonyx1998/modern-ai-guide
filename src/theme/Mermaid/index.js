/* Swizzles @theme/Mermaid. The house-style renderer now lives in the shared
 * @throughline/guide-kit (single source of truth across the Modern guides).
 * This thin shim is the only Docusaurus-specific glue: it supplies
 * @theme-original/Mermaid as the fallback for diagram types the house renderer
 * doesn't handle (gantt, pie, …).
 *
 * Styles: @throughline/guide-kit/styles/mermaid.css, loaded at build time via
 * `theme.customCss` in docusaurus.config.ts. */
import React from 'react';
import OriginalMermaid from '@theme-original/Mermaid';
import GuideMermaid from '@throughline/guide-kit/mermaid';

export default function Mermaid({ value }) {
  return <GuideMermaid value={value} Fallback={OriginalMermaid} />;
}
