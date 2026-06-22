import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

/**
 * <AskAI> — "Ask AI about this page", scoped to the current lesson.
 *
 * IMPORTANT: this ships DISABLED by default and contains NO API key. It POSTs
 * the user's question + the current page's text to an endpoint you configure in
 * docusaurus.config (`customFields.askAiEndpoint`) — your own backend that holds
 * the provider key and does the LLM call. Until that endpoint is set, the widget
 * renders a clear "not configured" state and makes no network calls.
 *
 * Designed as scaffold-and-fade: it answers FROM this page and links back to the
 * source, rather than being a general answer-vending machine (the research warns
 * that unrestricted AI help erodes unassisted skill).
 */

function pageText(): string {
  const el =
    document.querySelector('.theme-doc-markdown') ?? document.querySelector('.markdown');
  // Cap the context we send; the backend can re-truncate.
  return (el?.textContent || '').trim().slice(0, 12000);
}

export default function AskAI(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const endpoint = (siteConfig.customFields?.askAiEndpoint as string) || '';
  const {pathname} = useLocation();

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  // Only on lesson pages.
  if (!pathname.includes('/docs/')) return null;

  const ask = async () => {
    if (!q.trim()) return;
    setStatus('loading');
    setAnswer('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question: q, url: window.location.href, content: pageText()}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      const text = ct.includes('application/json')
        ? (await res.json()).answer ?? JSON.stringify(await res.json())
        : await res.text();
      setAnswer(String(text));
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Ask AI about this page">
        ✦ Ask AI
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Ask AI about this page">
          <div className={styles.head}>
            <span>Ask about this page</span>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>

          {!endpoint ? (
            <div className={styles.notConfigured}>
              <p>
                <b>Ask-AI isn’t enabled on this site yet.</b>
              </p>
              <p>
                This widget is wired and ready — it just needs an endpoint to talk to. Set{' '}
                <code>customFields.askAiEndpoint</code> in <code>docusaurus.config.ts</code> to a
                backend that holds your provider API key and proxies the question to an LLM. No key
                is ever stored in the site itself.
              </p>
            </div>
          ) : (
            <>
              <textarea
                className={styles.input}
                rows={3}
                value={q}
                placeholder="e.g. Explain context rot in simpler terms"
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                type="button"
                className={styles.ask}
                onClick={ask}
                disabled={status === 'loading' || !q.trim()}>
                {status === 'loading' ? 'Thinking…' : 'Ask'}
              </button>
              {status === 'error' && (
                <p className={styles.error}>Couldn’t reach the AI endpoint. Try again.</p>
              )}
              {answer && <div className={styles.answer}>{answer}</div>}
              <p className={styles.hint}>
                Answers are generated from this page. Always verify against the lesson itself.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
