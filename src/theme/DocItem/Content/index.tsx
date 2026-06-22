import React from 'react';
import type {ReactNode} from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import BrowserOnly from '@docusaurus/BrowserOnly';
import LessonProgress from '@site/src/components/LessonProgress';

type Props = WrapperProps<typeof ContentType>;

/**
 * Wrap the original doc content with a per-lesson meta strip
 * (reading time + mark-complete + overall progress). BrowserOnly because
 * LessonProgress measures the rendered DOM and reads localStorage.
 */
export default function ContentWrapper(props: Props): ReactNode {
  return (
    <>
      <BrowserOnly>{() => <LessonProgress />}</BrowserOnly>
      <Content {...props} />
    </>
  );
}
