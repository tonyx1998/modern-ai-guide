import React, {useCallback, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import styles from './styles.module.css';

/**
 * <LessonProgress> — a meta strip at the top of every lesson:
 *   ⏱ estimated reading time · ✓ mark-this-lesson-complete · N lessons done.
 *
 * Research on tutorial sites is consistent that visible progress + a reading-
 * time estimate reduce bounce and drive return visits (roadmap.sh, Medium).
 * Everything is local: reading time is measured from the rendered article;
 * completion is a per-path flag in localStorage. No backend, no tracking.
 */

const PREFIX = 'maeg:done:';
const WPM = 225;

function pathKey(): string {
  if (typeof window === 'undefined') return '';
  return PREFIX + window.location.pathname.replace(/\/+$/, '');
}

function countCompleted(): number {
  try {
    let n = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX) && window.localStorage.getItem(k) === '1') n++;
    }
    return n;
  } catch {
    return 0;
  }
}

export default function LessonProgress(): ReactNode {
  const [mounted, setMounted] = useState(false);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Reading time — measure the rendered article text.
    const article =
      document.querySelector('.theme-doc-markdown') ??
      document.querySelector('.markdown');
    if (article) {
      const words = (article.textContent || '').trim().split(/\s+/).filter(Boolean).length;
      setMinutes(Math.max(1, Math.round(words / WPM)));
    }

    try {
      setDone(window.localStorage.getItem(pathKey()) === '1');
    } catch {
      /* ignore */
    }
    setTotal(countCompleted());
  }, []);

  const toggle = useCallback(() => {
    try {
      const key = pathKey();
      const next = !done;
      if (next) window.localStorage.setItem(key, '1');
      else window.localStorage.removeItem(key);
      setDone(next);
      setTotal(countCompleted());
    } catch {
      /* localStorage unavailable */
    }
  }, [done]);

  // Avoid hydration mismatch: render an inert placeholder until mounted.
  if (!mounted) {
    return <div className={styles.bar} aria-hidden="true" />;
  }

  return (
    <div className={styles.bar}>
      <span className={styles.read}>
        {minutes ? `⏱ ~${minutes} min read` : ''}
      </span>
      <span className={styles.spacer} />
      {total > 0 && <span className={styles.total}>{total} lessons completed</span>}
      <button
        type="button"
        className={`${styles.mark} ${done ? styles.markOn : ''}`}
        onClick={toggle}
        aria-pressed={done}>
        {done ? '✓ Completed' : 'Mark complete'}
      </button>
    </div>
  );
}
