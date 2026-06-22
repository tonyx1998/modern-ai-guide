import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import FeedbackWidget from '@site/src/components/FeedbackWidget';
import KeyboardShortcuts from '@site/src/components/KeyboardShortcuts';
import AskAI from '@site/src/components/AskAI';

// Swizzled Root wrapper: renders the whole app, plus the global feedback
// widget, keyboard shortcuts (Cmd/Ctrl+K → search), and the (config-gated)
// Ask-AI widget. BrowserOnly keeps DOM/localStorage-reading widgets out of SSR.
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <KeyboardShortcuts />
      <BrowserOnly>{() => <FeedbackWidget />}</BrowserOnly>
      <BrowserOnly>{() => <AskAI />}</BrowserOnly>
    </>
  );
}
