import React, {useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {fsrs, generatorParameters, createEmptyCard, Rating, type Card} from 'ts-fsrs';
import {REVIEW_DECK} from '@site/src/data/reviewDeck';
import styles from './review.module.css';

/**
 * Spaced-repetition review of the guide's key concepts, scheduled with FSRS
 * (the modern successor to SM-2 — same retention for ~20–30% fewer reviews).
 *
 * Retrieval practice + spacing are the two highest-utility study strategies in
 * the research, so this turns the guide's quiz questions into a durable habit.
 * Entirely local: the schedule lives in localStorage, no account, no backend.
 */

const STORE_KEY = 'maeg:fsrs:v1';
const scheduler = fsrs(generatorParameters({enable_fuzz: true}));

type Schedule = Record<string, Card>;

function reviveCard(raw: any): Card {
  return {
    ...raw,
    due: new Date(raw.due),
    last_review: raw.last_review ? new Date(raw.last_review) : undefined,
  } as Card;
}

function loadSchedule(): Schedule {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}');
    const out: Schedule = {};
    for (const id of Object.keys(raw)) out[id] = reviveCard(raw[id]);
    return out;
  } catch {
    return {};
  }
}

function saveSchedule(s: Schedule) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function relative(due: Date, now: Date): string {
  const ms = due.getTime() - now.getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr`;
  return `${Math.round(hrs / 24)} day(s)`;
}

function ReviewApp(): ReactNode {
  const [schedule, setSchedule] = useState<Schedule>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reviewedThisSession, setReviewed] = useState(0);

  // Build the due queue once on mount.
  useEffect(() => {
    const s = loadSchedule();
    const now = new Date();
    const due = REVIEW_DECK.filter((c) => {
      const card = s[c.id];
      return !card || new Date(card.due).getTime() <= now.getTime();
    }).map((c) => c.id);
    setSchedule(s);
    setQueue(due);
    setPos(0);
  }, []);

  const currentId = queue[pos];
  const card = useMemo(() => REVIEW_DECK.find((c) => c.id === currentId), [currentId]);

  const grade = (rating: Rating) => {
    if (!card) return;
    const now = new Date();
    const existing = schedule[card.id] ?? createEmptyCard(now);
    const next = scheduler.next(existing, now, rating).card;
    const updated = {...schedule, [card.id]: next};
    setSchedule(updated);
    saveSchedule(updated);
    setReviewed((n) => n + 1);
    setSelected(null);
    setPos((p) => p + 1);
  };

  // Next due time across the whole deck, for the "all caught up" state.
  const nextDue = useMemo(() => {
    const now = new Date();
    let min: Date | null = null;
    for (const c of REVIEW_DECK) {
      const cd = schedule[c.id];
      if (cd && new Date(cd.due).getTime() > now.getTime()) {
        if (!min || new Date(cd.due) < min) min = new Date(cd.due);
      }
    }
    return min;
  }, [schedule, pos]);

  const resetAll = () => {
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    setSchedule({});
    setQueue(REVIEW_DECK.map((c) => c.id));
    setPos(0);
    setSelected(null);
  };

  const dueLeft = queue.length - pos;

  if (pos >= queue.length) {
    return (
      <div className={styles.done}>
        <div className={styles.bigCheck}>✓</div>
        <h2>{reviewedThisSession > 0 ? 'Session complete' : "You're all caught up"}</h2>
        <p>
          {reviewedThisSession > 0
            ? `You reviewed ${reviewedThisSession} card${reviewedThisSession === 1 ? '' : 's'} this session. `
            : 'No cards are due right now. '}
          {nextDue
            ? `Next card is due in about ${relative(nextDue, new Date())}.`
            : 'Come back tomorrow to keep the streak going.'}
        </p>
        <button type="button" className={styles.reset} onClick={resetAll}>
          Reset all progress
        </button>
      </div>
    );
  }

  if (!card) return null;
  const answered = selected !== null;
  const correct = answered && selected === card.correct;

  return (
    <div className={styles.session}>
      <div className={styles.progress}>
        <span className={styles.topic}>{card.topic}</span>
        <span className={styles.counter}>{dueLeft} due</span>
      </div>

      <h2 className={styles.prompt}>{card.prompt}</h2>

      <div className={styles.options}>
        {card.options.map((opt, i) => {
          const isCorrect = i === card.correct;
          const isPicked = i === selected;
          const cls = [
            styles.option,
            answered && isCorrect ? styles.correct : '',
            answered && isPicked && !isCorrect ? styles.wrong : '',
          ].join(' ');
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => setSelected(i)}>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={styles.reveal}>
          <p className={correct ? styles.verdictOk : styles.verdictNo}>
            {correct ? '✓ Correct' : '✗ Not quite'}
          </p>
          <p className={styles.explanation}>{card.explanation}</p>
          <Link className={styles.lessonLink} to={card.href}>
            Revisit the lesson →
          </Link>

          <div className={styles.rateRow}>
            <span className={styles.rateLabel}>How well did you know it?</span>
            <div className={styles.rateButtons}>
              <button type="button" className={styles.again} onClick={() => grade(Rating.Again)}>
                Again
              </button>
              <button type="button" className={styles.hard} onClick={() => grade(Rating.Hard)}>
                Hard
              </button>
              <button type="button" className={styles.good} onClick={() => grade(Rating.Good)}>
                Good
              </button>
              <button type="button" className={styles.easy} onClick={() => grade(Rating.Easy)}>
                Easy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage(): ReactNode {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Layout
      title="Review"
      description="Spaced-repetition review of the guide's key AI-engineering concepts, scheduled with FSRS.">
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.kicker}>Spaced repetition · FSRS</span>
          <h1>Review</h1>
          <p>
            Retrieval practice plus spacing is the most effective way to make this guide stick.
            Each card is scheduled with the FSRS algorithm and saved in your browser only — answer,
            rate how well you knew it, and the harder ones come back sooner.
          </p>
        </header>
        {mounted ? <ReviewApp /> : <div className={styles.loading}>Loading your deck…</div>}
      </main>
    </Layout>
  );
}
