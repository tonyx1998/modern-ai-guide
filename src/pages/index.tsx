import {useEffect, useRef, type ReactNode, type RefObject} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

import '../css/landing.css';

/* ---- content model (maps the design's copy to real /docs routes) ---- */
const THEMES = [
  {
    motif: 'embed',
    num: 'THEME 01',
    title: 'How LLM systems actually work',
    body: 'Tokens, embeddings, the transformer, context windows, sampling, streaming, tool calling, RAG, and agent loops — just enough to be useful.',
    tags: ['tokens', 'embeddings', 'RAG', 'agents'],
    cta: 'Read Foundations',
    to: '/docs/foundations',
  },
  {
    motif: 'grid',
    num: 'THEME 02',
    title: 'The 2026 AI toolbox',
    body: 'Every major provider, framework, and service: what it does, when to use it, why it exists, and what it replaces.',
    tags: ['vLLM', 'LangChain', 'pgvector', 'Langfuse'],
    cta: 'Read Tech Stack',
    to: '/docs/stack',
  },
  {
    motif: 'lanes',
    num: 'THEME 03',
    title: 'Workflows at every scale',
    body: 'Solo indie builder, 20-person AI startup, and 2,000-engineer enterprise — three radically different ways to ship the same feature.',
    tags: ['solo', 'startup', 'enterprise'],
    cta: 'Compare workflows',
    to: '/docs/comparison',
  },
  {
    motif: 'cycle',
    num: 'THEME 04',
    title: 'The lifecycle & the patterns',
    body: 'From “idea” to “shipped and measured,” plus the patterns that recur in every production LLM app.',
    tags: ['evals', 'streaming', 'fallbacks', 'safety'],
    cta: 'Read Lifecycle',
    to: '/docs/lifecycle',
  },
  {
    motif: 'branch',
    num: 'THEME 05',
    title: 'Decision frameworks',
    body: 'The recurring “should we…” debates, each with a concrete decision rule instead of hand-waving.',
    tags: ['prompt vs RAG', 'build vs buy', 'open vs closed'],
    cta: 'Read Decisions',
    to: '/docs/decisions',
  },
  {
    motif: 'rise',
    num: 'THEME 06',
    title: 'Career',
    body: 'What an AI engineer actually does in 2026, the specialization tracks, and how to position yourself.',
    tags: ['AI vs ML eng', 'portfolio', 'comp'],
    cta: 'Read Career',
    to: '/docs/career',
  },
];

const CHAPTERS = [
  {n: '01', t: 'Foundations', d: 'How LLM systems work', to: '/docs/foundations'},
  {n: '02', t: 'Roadmap', d: 'From zero to shipping', to: '/docs/roadmap'},
  {n: '03', t: 'Lifecycle', d: 'Idea → shipped → measured', to: '/docs/lifecycle'},
  {n: '04', t: 'Tech Stack', d: 'The 2026 toolbox', to: '/docs/stack'},
  {n: '05', t: 'Evaluation', d: 'The #1 discipline', to: '/docs/evaluation'},
  {n: '06', t: 'Responsible & Safe AI', d: 'Threats, guardrails, governance', to: '/docs/safety'},
  {n: '07', t: 'Fine-tuning', d: 'When prompting isn’t enough', to: '/docs/fine-tuning'},
  {n: '08', t: 'Multimodal & Voice', d: 'Beyond text', to: '/docs/multimodal'},
  {n: '09', t: 'Solo / Indie', d: 'Ship alone, free tier', to: '/docs/solo'},
  {n: '10', t: 'Startup AI Team', d: '20-person, eval-first', to: '/docs/startup'},
  {n: '11', t: 'Enterprise AI', d: 'Governance & private cloud', to: '/docs/enterprise'},
  {n: '12', t: 'Comparison', d: 'Scale-by-scale tradeoffs', to: '/docs/comparison'},
  {n: '13', t: 'Decisions', d: 'The “should we…” rules', to: '/docs/decisions'},
  {n: '14', t: 'Production Patterns', d: 'What recurs everywhere', to: '/docs/patterns'},
  {n: '15', t: 'Career', d: 'Position yourself', to: '/docs/career'},
  {n: '16', t: 'Case Studies', d: 'Eight shipped systems', to: '/docs/case-studies'},
  {n: '17', t: 'Cutting Edge', d: 'The 2026 frontier', to: '/docs/cutting-edge'},
  {n: '18', t: 'Glossary', d: 'Every term, defined', to: '/docs/glossary'},
];

const FIRST_LESSON = '/docs/foundations/tokens';

/**
 * All landing-page motion, ported from the mockup's motifs.js + inline hero
 * script. Runs browser-only (inside useEffect) and is fully cleaned up on
 * unmount so client-side navigation / HMR never stacks animation loops.
 */
function useLandingMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rafs: number[] = []; // finite loops (count-up)
    let meshFrame = 0; // continuous loop ids — replaced in place each frame
    let motifFrame = 0;
    const cleanups: Array<() => void> = [];

    const accentHex = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c4f042';
    const accentRGB = () => {
      let h = accentHex().replace('#', '');
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
    };

    /* ---- pointer-tracking spotlight on cards ---- */
    root.querySelectorAll<HTMLElement>('.theme, .chap').forEach((card) => {
      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      card.addEventListener('pointermove', onMove);
      cleanups.push(() => card.removeEventListener('pointermove', onMove));
    });

    /* ---- looping token stream in the code card ---- */
    const toks = root.querySelectorAll<HTMLElement>('.hero-card .tok');
    if (toks.length && !reduce) {
      const id = window.setInterval(() => {
        toks.forEach((t) => {
          t.style.animation = 'none';
          void t.offsetWidth; // reflow to restart
          t.style.animation = '';
        });
      }, 5200);
      cleanups.push(() => window.clearInterval(id));
    }

    /* ---- hero stat count-up ---- */
    root.querySelectorAll<HTMLElement>('.stat .n[data-count]').forEach((el) => {
      const target = +(el.dataset.count || '0');
      const suf = el.dataset.suffix || '';
      if (reduce) {
        el.textContent = target + suf;
        return;
      }
      const dur = 1200;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) rafs.push(requestAnimationFrame(step));
      };
      rafs.push(requestAnimationFrame(step));
    });

    /* ---- ground-truth badge pop-in on scroll ---- */
    const badges = root.querySelectorAll<HTMLElement>('.truth .idx');
    if (badges.length) {
      if (reduce || !('IntersectionObserver' in window)) {
        badges.forEach((b) => b.classList.add('in'));
      } else {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
              }
            });
          },
          {threshold: 0.5},
        );
        badges.forEach((b) => io.observe(b));
        cleanups.push(() => io.disconnect());
      }
    }

    /* ---- neural-mesh hero backdrop ---- */
    const canvas = root.querySelector<HTMLCanvasElement>('.hero canvas.mesh');
    if (canvas && !reduce) {
      const ctx = canvas.getContext('2d')!;
      let W = 0;
      let H = 0;
      let nodes: Array<{x: number; y: number; vx: number; vy: number; r: number}> = [];

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.max(22, Math.min(46, Math.round(W / 34)));
        nodes = [];
        for (let i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            r: Math.random() * 1.6 + 1,
          });
        }
      };

      const frame = () => {
        const rgb = accentRGB();
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
          for (let j = i + 1; j < nodes.length; j++) {
            const m = nodes[j];
            const dx = n.x - m.x;
            const dy = n.y - m.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 132) {
              ctx.strokeStyle = `rgba(${rgb},${0.16 * (1 - d / 132)})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(m.x, m.y);
              ctx.stroke();
            }
          }
        }
        for (let k = 0; k < nodes.length; k++) {
          const p = nodes[k];
          ctx.fillStyle = `rgba(${rgb},0.55)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        meshFrame = requestAnimationFrame(frame);
      };

      resize();
      window.addEventListener('resize', resize);
      cleanups.push(() => window.removeEventListener('resize', resize));
      meshFrame = requestAnimationFrame(frame);
    } else if (canvas) {
      canvas.style.display = 'none';
    }

    /* ---- generative motif headers on the theme cards ---- */
    const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };

    type MotifCanvas = HTMLCanvasElement & {
      _ctx?: CanvasRenderingContext2D;
      _w?: number;
      _h?: number;
      _pts?: any[];
      _cells?: any[];
      _dots?: any[];
    };
    const motifs = Array.from(root.querySelectorAll<MotifCanvas>('.theme .motif'));

    const setup = (cv: MotifCanvas) => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = w * dpr;
      cv.height = h * dpr;
      const ctx = cv.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cv._ctx = ctx;
      cv._w = w;
      cv._h = h;
      const t = cv.dataset.motif;
      if (t === 'embed') {
        const cl = [[w * 0.26, h * 0.46], [w * 0.55, h * 0.34], [w * 0.76, h * 0.6]];
        cv._pts = [];
        for (let i = 0; i < 32; i++) {
          const c = cl[i % 3];
          cv._pts.push({cx: c[0], cy: c[1], a: Math.random() * 6.28, r: 5 + Math.random() * 15, sp: 0.3 + Math.random() * 0.7, s: 0.9 + Math.random() * 1.3});
        }
      } else if (t === 'grid') {
        cv._cells = [];
        const cols = 11;
        const rows = 4;
        const gx = w / (cols + 1);
        const gy = h / (rows + 1);
        for (let rIdx = 0; rIdx < rows; rIdx++) {
          for (let c2 = 0; c2 < cols; c2++) cv._cells.push({x: gx * (c2 + 1), y: gy * (rIdx + 1), ph: Math.random() * 6.28});
        }
      } else if (t === 'lanes') {
        cv._dots = [];
        for (let l = 0; l < 3; l++) {
          const y = (h * (l + 1)) / 4;
          for (let d = 0; d < 6; d++) cv._dots.push({y, x: Math.random() * w, sp: 0.25 + l * 0.22});
        }
      }
    };

    const drawMotif = (cv: MotifCanvas, time: number) => {
      const ctx = cv._ctx;
      if (!ctx) return;
      const w = cv._w!;
      const h = cv._h!;
      const A = accentRGB();
      const t = cv.dataset.motif;
      ctx.clearRect(0, 0, w, h);

      if (t === 'embed') {
        const p = cv._pts!.map((o) => {
          o.a += o.sp * 0.012;
          return {x: o.cx + Math.cos(o.a) * o.r, y: o.cy + Math.sin(o.a) * o.r, s: o.s};
        });
        for (let i = 0; i < p.length; i++) {
          for (let j = i + 1; j < p.length; j++) {
            const dx = p[i].x - p[j].x;
            const dy = p[i].y - p[j].y;
            const dd = Math.sqrt(dx * dx + dy * dy);
            if (dd < 30) {
              ctx.strokeStyle = `rgba(${A},${0.2 * (1 - dd / 30)})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p[i].x, p[i].y);
              ctx.lineTo(p[j].x, p[j].y);
              ctx.stroke();
            }
          }
        }
        p.forEach((o) => {
          ctx.fillStyle = `rgba(${A},0.72)`;
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.s, 0, 6.28);
          ctx.fill();
        });
      } else if (t === 'grid') {
        cv._cells!.forEach((c) => {
          const k = (Math.sin(time * 0.0022 + c.ph) + 1) / 2;
          const s = 3.4 + k * 2.6;
          ctx.fillStyle = `rgba(${A},${0.16 + k * 0.55})`;
          rr(ctx, c.x - s / 2, c.y - s / 2, s, s, 1.6);
          ctx.fill();
        });
      } else if (t === 'lanes') {
        for (let l = 0; l < 3; l++) {
          const y = (h * (l + 1)) / 4;
          ctx.strokeStyle = `rgba(${A},0.1)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        cv._dots!.forEach((o) => {
          o.x += o.sp;
          if (o.x > w + 5) o.x = -5;
          ctx.fillStyle = `rgba(${A},0.62)`;
          ctx.beginPath();
          ctx.arc(o.x, o.y, 2, 0, 6.28);
          ctx.fill();
        });
      } else if (t === 'cycle') {
        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) * 0.3;
        const ang = time * 0.0013;
        ctx.strokeStyle = `rgba(${A},0.22)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 6.28);
        ctx.stroke();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * 6.28;
          ctx.fillStyle = `rgba(${A},0.3)`;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 1.3, 0, 6.28);
          ctx.fill();
        }
        const px = cx + Math.cos(ang) * R;
        const py = cy + Math.sin(ang) * R;
        ctx.fillStyle = `rgba(${A},0.95)`;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, 6.28);
        ctx.fill();
        ctx.fillStyle = `rgba(${A},0.25)`;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 6.28);
        ctx.fill();
      } else if (t === 'branch') {
        const lx = w * 0.16;
        const ly = h / 2;
        const tips = [[w * 0.82, h * 0.26], [w * 0.86, h * 0.5], [w * 0.82, h * 0.74]];
        const sel = Math.floor(time / 1300) % 3;
        tips.forEach((tp, idx) => {
          const on = idx === sel;
          const mx = (lx + tp[0]) / 2;
          ctx.strokeStyle = `rgba(${A},${on ? 0.75 : 0.16})`;
          ctx.lineWidth = on ? 1.9 : 1;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.bezierCurveTo(mx, ly, mx, tp[1], tp[0], tp[1]);
          ctx.stroke();
          ctx.fillStyle = `rgba(${A},${on ? 0.95 : 0.28})`;
          ctx.beginPath();
          ctx.arc(tp[0], tp[1], on ? 3.2 : 2, 0, 6.28);
          ctx.fill();
        });
        ctx.fillStyle = `rgba(${A},0.95)`;
        ctx.beginPath();
        ctx.arc(lx, ly, 3.4, 0, 6.28);
        ctx.fill();
      } else if (t === 'rise') {
        const bars = 7;
        const slot = (w * 0.8) / bars;
        const bw = slot * 0.5;
        const base = h * 0.86;
        for (let b = 0; b < bars; b++) {
          const bx = w * 0.1 + b * slot + (slot - bw) / 2;
          const pr = (Math.sin(time * 0.0016 - b * 0.45) + 1) / 2;
          const bh = h * 0.16 + (b / (bars - 1)) * (h * 0.5) * (0.7 + 0.3 * pr);
          ctx.fillStyle = `rgba(${A},${0.28 + 0.45 * (b / (bars - 1))})`;
          rr(ctx, bx, base - bh, bw, bh, 2);
          ctx.fill();
        }
      }
    };

    if (motifs.length) {
      motifs.forEach(setup);
      const onResize = () => motifs.forEach(setup);
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));
      if (reduce) {
        motifs.forEach((cv) => drawMotif(cv, 1000));
      } else {
        const loop = (time: number) => {
          motifs.forEach((cv) => drawMotif(cv, time));
          motifFrame = requestAnimationFrame(loop);
        };
        motifFrame = requestAnimationFrame(loop);
      }
    }

    return () => {
      rafs.forEach((id) => cancelAnimationFrame(id));
      cancelAnimationFrame(meshFrame);
      cancelAnimationFrame(motifFrame);
      cleanups.forEach((fn) => fn());
    };
  }, [rootRef]);
}

export default function Home(): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  useLandingMotion(rootRef);

  return (
    <Layout
      title="Everything useful in AI"
      description="A comprehensive guide to designing, building, evaluating, shipping, and operating LLM-powered applications and agentic systems — from your first API call to production at enterprise scale.">
      <div className="maeg" ref={rootRef}>
        {/* ---------------- HERO ---------------- */}
        <header className="hero">
          <canvas className="mesh" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div>
              <span className="kicker">2026 Edition · For absolute beginners and beyond</span>
              <h1 className="display">
                How AI systems are
                <br />
                <em>actually built.</em>
              </h1>
              <p className="sub">
                A comprehensive guide to designing, building, evaluating, shipping, and operating
                LLM-powered applications and agentic systems — from your first API call to
                production at enterprise scale.
              </p>
              <div className="hero-cta">
                <Link to={FIRST_LESSON} className="btn btn-primary">
                  Start the first lesson <span className="arr">→</span>
                </Link>
                <a href="#chapters" className="btn btn-ghost">
                  Browse all 18 chapters
                </a>
              </div>
              <div className="hero-meta">
                <div className="stat">
                  <div className="n display" data-count={18}>
                    18
                  </div>
                  <div className="l">Chapters</div>
                </div>
                <div className="stat">
                  <div className="n display" data-count={240} data-suffix="+">
                    240+
                  </div>
                  <div className="l">Single-topic pages</div>
                </div>
                <div className="stat">
                  <div className="n display">Jun ’26</div>
                  <div className="l">Last reviewed</div>
                </div>
                <div className="stat">
                  <div className="n display">$0</div>
                  <div className="l">Free · open source</div>
                </div>
              </div>
            </div>

            {/* code card */}
            <div className="hero-card">
              <div className="hc-bar">
                <span className="dots">
                  <i style={{background: '#ff5f57'}} />
                  <i style={{background: '#febc2e'}} />
                  <i style={{background: '#28c840'}} />
                </span>
                <span className="lang">count_tokens.py</span>
                <span className="live">running</span>
              </div>
              <pre>
                <span className="cm"># An LLM only ever sees tokens — not words.</span>
                {'\n'}
                <span className="kw">import</span> tiktoken{'\n'}
                {'\n'}
                enc &nbsp;= tiktoken.encoding_for_model(<span className="st">"gpt-4o"</span>){'\n'}
                text = <span className="st">"tokenization is fun"</span>
                {'\n'}
                toks = enc.encode(text){'\n'}
                {'\n'}
                <span className="fn">print</span>(toks){'\n'}
                <span className="cm"># →</span>{' '}
                <span className="tok" style={{animationDelay: '.2s'}}>
                  token
                </span>
                <span className="tok" style={{animationDelay: '.5s'}}>
                  ization
                </span>
                <span className="tok" style={{animationDelay: '.8s'}}>
                  {' '}
                  is
                </span>
                <span className="tok" style={{animationDelay: '1.1s'}}>
                  {' '}
                  fun
                </span>
                {'\n'}
                <span className="cm"># →</span> [<span className="nu">3239, 2065, 374, 2523</span>]
                <span className="cursor" />
              </pre>
              <div className="hc-foot">
                <span>4 tokens · 19 chars</span>
                <span>~¾ word per token</span>
              </div>
            </div>
          </div>
        </header>

        {/* ---------------- GROUND TRUTHS ---------------- */}
        <section className="band">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">Start here</span>
              <h2 className="display">Two ground-truth facts before you write a line of code.</h2>
            </div>
            <div className="truths">
              <div className="truth">
                <div className="idx">01</div>
                <h3 className="display">An LLM is just a function: text in, text out.</h3>
                <p>
                  Every advanced feature — chat, search, agents, multimodal — is layered on top of
                  that single primitive. Master the primitive and the rest is assembly.
                </p>
              </div>
              <div className="truth">
                <div className="idx">02</div>
                <h3 className="display">
                  It’s mostly software engineering, plus three new disciplines.
                </h3>
                <p>
                  Add <code>prompting</code>, <code>retrieval</code>, and <code>evals</code> to what
                  you already know. If you can build a CRUD app, you’re 70% of the way there.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- THEMES ---------------- */}
        <section className="band">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">What this guide covers</span>
              <h2 className="display">Six themes, eighteen chapters.</h2>
              <p>
                Written so a beginner can follow along while still being useful to working
                engineers. Read in order, or jump to what you need.
              </p>
            </div>
            <div className="themes">
              {THEMES.map((th) => (
                <Link key={th.num} to={th.to} className="theme">
                  <canvas className="motif" data-motif={th.motif} aria-hidden="true" />
                  <span className="num">{th.num}</span>
                  <h3 className="display">{th.title}</h3>
                  <p>{th.body}</p>
                  <div className="tags">
                    {th.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <span className="go">
                    {th.cta} <span className="arr">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- CHAPTERS / PATH ---------------- */}
        <section className="band path-wrap" id="chapters">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">The full path</span>
              <h2 className="display">Eighteen chapters, one per stop.</h2>
              <p>
                Designed so you can master one topic per page and always know what comes next.
              </p>
            </div>
            <div className="chapters">
              {CHAPTERS.map((ch) => (
                <Link key={ch.n} to={ch.to} className="chap">
                  <span className="cn">{ch.n}</span>
                  <span>
                    <span className="ct">{ch.t}</span>
                    <span className="cd">{ch.d}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- AUDIENCE ---------------- */}
        <section className="band">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">Who it’s for</span>
              <h2 className="display">Meets you wherever you are.</h2>
            </div>
            <div className="aud">
              <div className="pole">
                <div className="role">“I’ve used ChatGPT…”</div>
                <div className="desc">
                  …but never written a line of code against an LLM. Start at token one — no calculus,
                  no PyTorch.
                </div>
              </div>
              <div className="arrowline">
                <svg
                  width="56"
                  height="24"
                  viewBox="0 0 56 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round">
                  <path className="ln" d="M2 12h46" />
                  <path d="M44 5l8 7-8 7" />
                </svg>
              </div>
              <div className="pole">
                <div className="role">“I ship production AI.”</div>
                <div className="desc">
                  …and want a sharp refresh on 2026 tooling, decision rules, and the patterns that
                  actually hold up.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- CLOSING ---------------- */}
        <section className="closing">
          <div className="wrap">
            <span className="kicker">Ready?</span>
            <h2 className="display">What is a token?</h2>
            <p>
              The whole guide fans out from one idea. Twenty minutes from now you’ll know exactly why
              every bill, every context limit, and every latency number is measured in tokens.
            </p>
            <div className="hero-cta">
              <Link to={FIRST_LESSON} className="btn btn-primary">
                Start with the first lesson <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
