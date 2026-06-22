import React, {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './roadmap.module.css';

/**
 * A visual learning roadmap across the 18 chapters, grouped by the 7 Parts.
 * Externalizing the expert's knowledge map (roadmap.sh-style) helps learners
 * see structure and prerequisites — and the per-chapter completion badges read
 * the SAME `maeg:done:` localStorage keys the per-lesson progress strip writes,
 * so finishing lessons lights up the map. Entirely local, no account.
 */

const DONE_PREFIX = 'maeg:done:';

interface Chapter {
  n: string;
  title: string;
  blurb: string;
  to: string;
}
interface Part {
  letter: string;
  name: string;
  chapters: Chapter[];
}

const PARTS: Part[] = [
  {
    letter: 'A',
    name: 'Fundamentals',
    chapters: [
      {n: '1', title: 'Foundations', blurb: 'How LLM systems actually work', to: '/docs/foundations'},
      {n: '2', title: 'Roadmap', blurb: 'From zero to shipping', to: '/docs/roadmap'},
    ],
  },
  {
    letter: 'B',
    name: 'Building & shipping',
    chapters: [
      {n: '3', title: 'Lifecycle', blurb: 'Idea → shipped → measured', to: '/docs/lifecycle'},
      {n: '4', title: 'Tech Stack', blurb: 'The 2026 toolbox', to: '/docs/stack'},
    ],
  },
  {
    letter: 'C',
    name: 'Core disciplines',
    chapters: [
      {n: '5', title: 'Evaluation', blurb: 'The #1 discipline', to: '/docs/evaluation'},
      {n: '6', title: 'Responsible & Safe AI', blurb: 'Threats, guardrails, governance', to: '/docs/safety'},
    ],
  },
  {
    letter: 'D',
    name: 'Specializations',
    chapters: [
      {n: '7', title: 'Fine-tuning', blurb: 'When prompting isn’t enough', to: '/docs/fine-tuning'},
      {n: '8', title: 'Multimodal & Voice', blurb: 'Beyond text', to: '/docs/multimodal'},
    ],
  },
  {
    letter: 'E',
    name: 'Workflows by scale',
    chapters: [
      {n: '9', title: 'Solo / Indie', blurb: 'Ship alone, free tier', to: '/docs/solo'},
      {n: '10', title: 'Startup AI Team', blurb: '20-person, eval-first', to: '/docs/startup'},
      {n: '11', title: 'Enterprise AI', blurb: 'Governance & private cloud', to: '/docs/enterprise'},
      {n: '12', title: 'Comparison', blurb: 'Scale-by-scale tradeoffs', to: '/docs/comparison'},
    ],
  },
  {
    letter: 'F',
    name: 'Judgment & patterns',
    chapters: [
      {n: '13', title: 'Decisions', blurb: 'The “should we…” rules', to: '/docs/decisions'},
      {n: '14', title: 'Production Patterns', blurb: 'What recurs everywhere', to: '/docs/patterns'},
    ],
  },
  {
    letter: 'G',
    name: 'Career & reference',
    chapters: [
      {n: '15', title: 'Career', blurb: 'Position yourself', to: '/docs/career'},
      {n: '16', title: 'Case Studies', blurb: 'Eight shipped systems', to: '/docs/case-studies'},
      {n: '17', title: 'Cutting Edge', blurb: 'The 2026 frontier', to: '/docs/cutting-edge'},
      {n: '18', title: 'Glossary', blurb: 'Every term, defined', to: '/docs/glossary'},
    ],
  },
];

function RoadmapView(): ReactNode {
  // completed-lesson count per chapter route (suffix after baseUrl), + total.
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const docsBase = useBaseUrl('/docs/');

  useEffect(() => {
    const c: Record<string, number> = {};
    let t = 0;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (!k || !k.startsWith(DONE_PREFIX)) continue;
        if (window.localStorage.getItem(k) !== '1') continue;
        t++;
        // key looks like: maeg:done:/<base>/docs/<chapter>/<lesson>
        const path = k.slice(DONE_PREFIX.length);
        const idx = path.indexOf('/docs/');
        if (idx === -1) continue;
        const rest = path.slice(idx + '/docs/'.length); // <chapter>/<lesson>
        const chapter = rest.split('/')[0];
        if (chapter) c[chapter] = (c[chapter] || 0) + 1;
      }
    } catch {
      /* ignore */
    }
    setCounts(c);
    setTotal(t);
  }, [docsBase]);

  const chapterKey = (to: string) => to.replace('/docs/', '');

  return (
    <>
      <div className={styles.totalBar}>
        {total > 0 ? (
          <span>
            <b>{total}</b> lesson{total === 1 ? '' : 's'} completed across the guide. Keep going —
            your progress is saved in this browser.
          </span>
        ) : (
          <span>
            Mark lessons complete as you read (the button at the top of each lesson) and they’ll
            light up here.
          </span>
        )}
      </div>

      <div className={styles.map}>
        {PARTS.map((part) => (
          <section key={part.letter} className={styles.part}>
            <div className={styles.partHead}>
              <span className={styles.partLetter}>{part.letter}</span>
              <span className={styles.partName}>{part.name}</span>
            </div>
            <div className={styles.nodes}>
              {part.chapters.map((ch) => {
                const done = counts[chapterKey(ch.to)] || 0;
                return (
                  <Link key={ch.n} to={ch.to} className={styles.node}>
                    <span className={`${styles.num} ${done > 0 ? styles.numDone : ''}`}>
                      {done > 0 ? '✓' : ch.n}
                    </span>
                    <span className={styles.nodeBody}>
                      <span className={styles.nodeTitle}>{ch.title}</span>
                      <span className={styles.nodeBlurb}>{ch.blurb}</span>
                    </span>
                    {done > 0 && <span className={styles.badge}>{done} done</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default function RoadmapPage(): ReactNode {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Layout
      title="Roadmap"
      description="The full 17-chapter learning roadmap for the Modern AI Guide, grouped by part, with your progress.">
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.kicker}>The full path</span>
          <h1>Learning roadmap</h1>
          <p>
            Eighteen chapters in seven parts, in reading order — from “what is a token?” to agents,
            evals, fine-tuning, and the shipped architectures of real products. Read top to bottom,
            or jump to what you need.
          </p>
        </header>
        {mounted ? <RoadmapView /> : <div className={styles.loading}>Loading your progress…</div>}
      </main>
    </Layout>
  );
}
