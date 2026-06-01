import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import FeedbackWidget from '@site/src/components/FeedbackWidget';

// Swizzled Root wrapper: renders the whole app, plus the global feedback
// widget on every page (the redesign ships it site-wide). BrowserOnly keeps
// the self-injecting widget out of the SSR pass.
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <BrowserOnly>{() => <FeedbackWidget />}</BrowserOnly>
    </>
  );
}
