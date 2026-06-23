import MDXComponents from '@theme-original/MDXComponents';
import Quiz, {Question} from '@site/src/components/Quiz';
import CodeChallenge from '@site/src/components/CodeChallenge';
import PredictThenReveal from '@site/src/components/PredictThenReveal';
import SamplingExplorer from '@site/src/components/SamplingExplorer';
import TokenCostCalculator from '@site/src/components/TokenCostCalculator';
import ChapterContents from '@site/src/components/ChapterContents';

/**
 * Register components that should be available in every MDX file
 * without an explicit import statement.
 */
export default {
  ...MDXComponents,
  Quiz,
  Question,
  CodeChallenge,
  PredictThenReveal,
  SamplingExplorer,
  TokenCostCalculator,
  ChapterContents,
};
