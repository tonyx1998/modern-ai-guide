import React, {useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import styles from './styles.module.css';

/**
 * <TokenCostCalculator> — a "play with the parameter" widget for LLM economics.
 *
 * Tokens are the unit of every cost conversation, but "$5 per million tokens"
 * stays abstract until you turn it into a monthly bill. The reader sets request
 * shape + volume + per-tier pricing and watches the cost — and crucially the
 * input-vs-output split — update live, which is how the "output is the
 * expensive half" lesson actually lands.
 *
 * Pure client-side arithmetic, no network. Renders deterministically on the
 * server (default state) and becomes interactive on hydration — SSR-safe.
 */

interface Preset {
  label: string;
  in: number; // $/Mtok input
  out: number; // $/Mtok output
}

// Illustrative June-2026 ballpark tiers (see the closed-providers page; prices drift).
const PRESETS: Preset[] = [
  {label: 'Flagship', in: 5, out: 25},
  {label: 'Workhorse', in: 1, out: 5},
  {label: 'Cheap', in: 0.1, out: 0.4},
];

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}): ReactNode {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.inputWrap}>
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange(Number.isFinite(n) && n >= min ? n : 0);
          }}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
    </label>
  );
}

const fmt = (n: number) =>
  n >= 1
    ? n.toLocaleString(undefined, {maximumFractionDigits: 2})
    : n.toLocaleString(undefined, {maximumFractionDigits: 4});

export default function TokenCostCalculator(): ReactNode {
  const [inTok, setInTok] = useState(1500); // input tokens per request
  const [outTok, setOutTok] = useState(500); // output tokens per request
  const [reqPerDay, setReqPerDay] = useState(10000);
  const [priceIn, setPriceIn] = useState(5);
  const [priceOut, setPriceOut] = useState(25);

  const calc = useMemo(() => {
    const inCostReq = (inTok / 1_000_000) * priceIn;
    const outCostReq = (outTok / 1_000_000) * priceOut;
    const perReq = inCostReq + outCostReq;
    const perMonth = perReq * reqPerDay * 30;
    const outShare = perReq > 0 ? (outCostReq / perReq) * 100 : 0;
    return {perReq, perMonth, outShare, inShareCost: inCostReq, outShareCost: outCostReq};
  }, [inTok, outTok, reqPerDay, priceIn, priceOut]);

  const setPreset = (p: Preset) => {
    setPriceIn(p.in);
    setPriceOut(p.out);
  };

  const activePreset = PRESETS.find((p) => p.in === priceIn && p.out === priceOut)?.label;

  return (
    <div className={styles.calc}>
      <div className={styles.tag}>Play with it · token cost</div>

      <div className={styles.presets}>
        <span className={styles.presetsLabel}>Pricing tier:</span>
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.label}
            className={`${styles.preset} ${activePreset === p.label ? styles.presetOn : ''}`}
            onClick={() => setPreset(p)}>
            {p.label}
          </button>
        ))}
        <span className={styles.presetHint}>
          (${priceIn}/${priceOut} per 1M in/out)
        </span>
      </div>

      <div className={styles.grid}>
        <NumberField label="Input tokens / request" value={inTok} onChange={setInTok} step={100} />
        <NumberField label="Output tokens / request" value={outTok} onChange={setOutTok} step={100} />
        <NumberField label="Requests / day" value={reqPerDay} onChange={setReqPerDay} step={100} />
        <NumberField label="$ / 1M input" value={priceIn} onChange={setPriceIn} step={0.1} suffix="$" />
        <NumberField label="$ / 1M output" value={priceOut} onChange={setPriceOut} step={0.1} suffix="$" />
      </div>

      <div className={styles.results}>
        <div className={styles.result}>
          <div className={styles.resultNum}>${fmt(calc.perReq)}</div>
          <div className={styles.resultLabel}>per request</div>
        </div>
        <div className={styles.result}>
          <div className={styles.resultNum}>${fmt(calc.perMonth)}</div>
          <div className={styles.resultLabel}>per month (~30 days)</div>
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.splitBar}>
          <div
            className={styles.splitIn}
            style={{width: `${100 - calc.outShare}%`}}
            title={`input: $${fmt(calc.inShareCost)}/req`}
          />
          <div
            className={styles.splitOut}
            style={{width: `${calc.outShare}%`}}
            title={`output: $${fmt(calc.outShareCost)}/req`}
          />
        </div>
        <p className={styles.splitNote}>
          <span className={styles.swatchIn} /> input ·{' '}
          <span className={styles.swatchOut} /> output — output is{' '}
          <b>{calc.outShare.toFixed(0)}%</b> of the cost here. Notice how much the bill moves when
          you raise <i>output</i> tokens vs <i>input</i> tokens: output is billed several times
          higher, so a chatty model hurts more than a long prompt.
        </p>
      </div>
    </div>
  );
}
