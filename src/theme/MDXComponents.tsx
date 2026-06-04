import MDXComponents from '@theme-original/MDXComponents';
import Quiz, {Question} from '@site/src/components/Quiz';
import CodeChallenge from '@site/src/components/CodeChallenge';

/**
 * Register components that should be available in every MDX file
 * without an explicit import statement.
 */
export default {
  ...MDXComponents,
  Quiz,
  Question,
  CodeChallenge,
};
