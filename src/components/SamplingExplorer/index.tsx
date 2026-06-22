import React, {useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import styles from './styles.module.css';

/**
 * <SamplingExplorer> — a "play with the parameter" widget for decoding.
 *
 * Reader drags the temperature (and optional top-p) sliders and watches the
 * next-token probability distribution sharpen or flatten in real time. This is
 * the single highest-leverage interactive technique for a guide: let the
 * learner manipulate the EXACT concept being taught (Josh Comeau / Distill).
 *
 * Pure client-side math (softmax over a fixed set of illustrative logits) — no
 * model call, no network. Renders deterministically on the server (default
 * temperature 1.0) and becomes interactive on hydration, so it is SSR-safe.
 */

interface Candidate {
  tok: string;
  logit: number;
}

// Illustrative next-token logits after the prompt "The cat sat on the ___".
// Hand-picked so the shape of the distribution is easy to read.
const DEFAULT_CANDIDATES: Candidate[] = [
  {tok: 'mat', logit: 3.5},
  {tok: 'floor', logit: 2.4},
  {tok: 'sofa', logit: 1.9},
  {tok: 'roof', logit: 1.1},
  {tok: 'keyboard', logit: 0.2},
  {tok: 'galaxy', logit: -1.6},
];

function softmaxWithTemperature(cands: Candidate[], temperature: number): number[] {
  // Greedy limit: as T → 0 the distribution collapses onto the argmax.
  if (temperature <= 0.05) {
    let best = 0;
    for (let i = 1; i < cands.length; i++) {
      if (cands[i].logit > cands[best].logit) best = i;
    }
    return cands.map((_, i) => (i === best ? 1 : 0));
  }
  const scaled = cands.map((c) => c.logit / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max)); // shift for numerical stability
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/** Apply nucleus (top-p) truncation, then renormalize. */
function applyTopP(probs: number[], topP: number): number[] {
  if (topP >= 1) return probs;
  const order = probs
    .map((p, i) => ({p, i}))
    .sort((a, b) => b.p - a.p);
  const keep = new Set<number>();
  let cum = 0;
  for (const {p, i} of order) {
    keep.add(i);
    cum += p;
    if (cum >= topP) break; // include the token that crosses the threshold
  }
  const kept = probs.map((p, i) => (keep.has(i) ? p : 0));
  const s = kept.reduce((a, b) => a + b, 0) || 1;
  return kept.map((p) => p / s);
}

export default function SamplingExplorer(): ReactNode {
  const [temperature, setTemperature] = useState(1.0);
  const [topP, setTopP] = useState(1.0);

  const probs = useMemo(() => {
    const base = softmaxWithTemperature(DEFAULT_CANDIDATES, temperature);
    return applyTopP(base, topP);
  }, [temperature, topP]);

  const isGreedy = temperature <= 0.05;
  const live = probs.filter((p) => p > 0).length;

  return (
    <div className={styles.explorer}>
      <div className={styles.tag}>Play with it · sampling</div>
      <p className={styles.prompt}>
        Next-token probabilities after <code>"The cat sat on the ___"</code>. Drag the
        sliders and watch the distribution sharpen or flatten.
      </p>

      <div className={styles.controls}>
        <label className={styles.control}>
          <span className={styles.controlLabel}>
            Temperature <b>{temperature.toFixed(2)}</b>
          </span>
          <input
            type="range"
            min={0.05}
            max={2}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            aria-label="Temperature"
          />
        </label>
        <label className={styles.control}>
          <span className={styles.controlLabel}>
            top-p <b>{topP.toFixed(2)}</b>
          </span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
            aria-label="top-p (nucleus)"
          />
        </label>
      </div>

      <div className={styles.bars}>
        {DEFAULT_CANDIDATES.map((c, i) => {
          const p = probs[i];
          const dead = p === 0;
          return (
            <div className={styles.row} key={c.tok}>
              <span className={`${styles.token} ${dead ? styles.dead : ''}`}>{c.tok}</span>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{width: `${Math.max(p * 100, dead ? 0 : 1.5)}%`}}
                />
              </div>
              <span className={`${styles.pct} ${dead ? styles.dead : ''}`}>
                {(p * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <p className={styles.readout}>
        {isGreedy ? (
          <>
            <b>Temperature ≈ 0 → greedy.</b> All the mass collapses onto the single
            highest-logit token, so generation is deterministic.
          </>
        ) : temperature >= 1.5 ? (
          <>
            <b>High temperature → flat.</b> Unlikely tokens (even <code>galaxy</code>) get
            real probability — more variety, more risk of nonsense.
          </>
        ) : topP < 1 ? (
          <>
            <b>top-p = {topP.toFixed(2)} → nucleus.</b> Only the smallest set of tokens whose
            probability sums past {topP.toFixed(2)} survives ({live} of {DEFAULT_CANDIDATES.length}
            here); the rest are zeroed out before sampling.
          </>
        ) : (
          <>
            <b>Temperature {temperature.toFixed(2)}.</b> Lower sharpens toward the top token;
            higher spreads the mass out. top-p is wide open, so no tokens are cut.
          </>
        )}
      </p>
    </div>
  );
}
