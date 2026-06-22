import {useEffect} from 'react';
import type {ReactNode} from 'react';

/**
 * Global Cmd/Ctrl+K → open search, over the EXISTING local search index
 * (@easyops-cn/docusaurus-search-local). No external service (no Algolia).
 *
 * The local-search theme renders a navbar search input (`.navbar__search-input`)
 * and, on smaller widths, a collapsed search button. We focus the input if it's
 * present, otherwise click the toggle — then let the plugin's own UI take over.
 * Also supports "/" as a quick-search shortcut (ignored while typing).
 */
export default function KeyboardShortcuts(): ReactNode {
  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        node.isContentEditable
      );
    };

    const openSearch = (): boolean => {
      const input = document.querySelector<HTMLInputElement>('.navbar__search-input');
      if (input) {
        input.focus();
        return true;
      }
      // Collapsed/mobile: click the search toggle button if present.
      const btn = document.querySelector<HTMLElement>(
        'button[class*="searchButton"], .navbar__search button, [aria-label="Search"]',
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (cmdK || (slash && !isTyping(e.target))) {
        if (openSearch()) e.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
