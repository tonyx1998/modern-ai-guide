import React, {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import styles from './styles.module.css';

/**
 * <PredictThenReveal> — a "generate, then correct" widget.
 *
 * Research on interactive articles (Distill, the NYT "You Draw It" series)
 * is consistent: making the reader COMMIT to a prediction before revealing
 * the answer beats passively reading it — the act of guessing, then seeing
 * the delta, is what makes it stick (the generation effect + self-explanation).
 *
 * This is *practice*, not a gate. The MCQ <Quiz> still gates the Next button.
 * No backend, no network — the guess is kept locally so a reader who revisits
 * the page sees what they predicted last time.
 *
 * Usage in MDX (the revealed answer is the children):
 *   <PredictThenReveal
 *     id="tokens-banana"
 *     question="How many tokens do you think the word ' strawberry' splits into for a modern tokenizer — 1, 2, or 3?">
 *
 *   Usually **three** — something like ` straw` + `berry` ... (markdown here)
 *
 *   </PredictThenReveal>
 */

interface PredictThenRevealProps {
  /** Stable id — used to remember the reader's guess in localStorage. */
  id: string;
  /** The prompt the reader predicts against. Plain text. */
  question: string;
  /** Placeholder for the guess box. */
  placeholder?: string;
  /** Label for the reveal button. */
  revealLabel?: string;
  /** The answer/explanation, revealed after the reader commits. */
  children: ReactNode;
}

export default function PredictThenReveal({
  id,
  question,
  placeholder = 'Write your prediction…',
  revealLabel = 'Reveal answer',
  children,
}: PredictThenRevealProps): ReactNode {
  const storageKey = `ptr:${id}`;
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);

  // Restore a previous guess on mount (client only — SSR-safe).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        setGuess(saved);
        setRevealed(true);
      }
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, [storageKey]);

  const reveal = () => {
    setRevealed(true);
    try {
      window.localStorage.setItem(storageKey, guess);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={styles.ptr}>
      <div className={styles.tag}>Predict, then reveal</div>
      <p className={styles.question}>{question}</p>

      <textarea
        className={styles.guess}
        value={guess}
        placeholder={placeholder}
        rows={2}
        onChange={(e) => setGuess(e.target.value)}
        aria-label="Your prediction"
      />

      {!revealed && (
        <div className={styles.actions}>
          <button type="button" className={styles.reveal} onClick={reveal}>
            {revealLabel}
          </button>
          <span className={styles.nudge}>
            Commit to a guess first — even a wrong one makes the answer stick.
          </span>
        </div>
      )}

      {revealed && (
        <div className={styles.answer}>
          <div className={styles.answerTag}>Answer</div>
          {children}
          <button
            type="button"
            className={styles.again}
            onClick={() => setRevealed(false)}>
            Hide again
          </button>
        </div>
      )}
    </div>
  );
}
