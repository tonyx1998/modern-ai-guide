import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import FeedbackWidget from '@site/src/components/FeedbackWidget';
import KeyboardShortcuts from '@site/src/components/KeyboardShortcuts';

// Swizzled Root wrapper: renders the whole app, plus the global feedback
// widget and global keyboard shortcuts (Cmd/Ctrl+K → search) on every page.
// BrowserOnly keeps the self-injecting widget out of the SSR pass.
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <KeyboardShortcuts />
      <BrowserOnly>{() => <FeedbackWidget />}</BrowserOnly>
    </>
  );
}
