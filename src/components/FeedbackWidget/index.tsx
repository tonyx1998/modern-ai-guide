import {useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import './styles.css';

/**
 * Floating "Feedback" button + bug/suggestion panel.
 * Ported from the redesign's feedback.js — self-injecting, keyboard-friendly
 * (Esc / click-outside), reduced-motion safe, recolors with the theme toggle.
 *
 * On submit it opens a prefilled GitHub issue and (if configured) pings a
 * Discord webhook. The submit handler is the swap-in point for a real backend.
 */
const ICON = {
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>',
  bug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.5 1.5M16 2l-1.5 1.5"/><rect x="8" y="6" width="8" height="14" rx="4"/><path d="M12 6v14M3 9h3M3 14h3M3 19l3-1M18 9h3M18 14h3M18 19l-3-1"/></svg>',
  idea: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0 0 12 3Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
};

export default function FeedbackWidget(): null {
  const {siteConfig} = useDocusaurusContext();
  const githubRepo =
    siteConfig.organizationName && siteConfig.projectName
      ? `${siteConfig.organizationName}/${siteConfig.projectName}`
      : 'tonyx1998/modern-ai-guide';

  useEffect(() => {
    // Avoid double-injection (React StrictMode double-effect, remounts).
    if (document.getElementById('fbFab')) return undefined;

    const CONFIG = {
      githubRepo,
      // ⚠ A Discord webhook in client code is publicly visible — proxy it
      //   through a serverless function before going live. Empty = disabled.
      discordWebhook: '',
    };

    const pageName = (document.title || 'This page').split('|')[0].split('—')[0].trim();

    const firstLine = (s: string, n: number) => {
      const t = (s.split('\n')[0] || '').trim();
      return t.length > n ? t.slice(0, n - 1) + '…' : t;
    };

    type Payload = {type: string; message: string; email: string; page: string; url: string; ts: string};

    const githubIssueUrl = (p: Payload) => {
      if (!CONFIG.githubRepo) return null;
      const title = (p.type === 'bug' ? '[Bug] ' : '[Suggestion] ') + firstLine(p.message, 70);
      const body =
        '**Type:** ' + (p.type === 'bug' ? 'Bug report' : 'Suggestion') + '\n' +
        '**Page:** ' + p.page + '\n' +
        '**URL:** ' + p.url + '\n\n' +
        '**Details**\n' + p.message + '\n\n' +
        (p.email ? '_Reporter: ' + p.email + '_\n\n' : '') +
        '<sub>Filed from the in-page feedback widget.</sub>';
      return (
        'https://github.com/' + CONFIG.githubRepo + '/issues/new' +
        '?title=' + encodeURIComponent(title) +
        '&labels=' + encodeURIComponent(p.type === 'bug' ? 'bug' : 'enhancement') +
        '&body=' + encodeURIComponent(body)
      );
    };

    const sendDiscord = (p: Payload) => {
      if (!CONFIG.discordWebhook) return Promise.resolve(false);
      const payload = {
        username: 'Guide Feedback',
        embeds: [
          {
            title: p.type === 'bug' ? '🐞 Bug report' : '💡 Suggestion',
            description: p.message.slice(0, 1800),
            color: p.type === 'bug' ? 0xef4444 : 0xc4f042,
            fields: [
              {name: 'Page', value: p.page || '—', inline: true},
              {name: 'Email', value: p.email || '—', inline: true},
              {name: 'URL', value: p.url},
            ],
            timestamp: p.ts,
          },
        ],
      };
      // FormData + payload_json avoids the CORS preflight that blocks JSON posts.
      const fd = new FormData();
      fd.append('payload_json', JSON.stringify(payload));
      return fetch(CONFIG.discordWebhook, {method: 'POST', body: fd})
        .then((r) => r.ok)
        .catch(() => false);
    };

    const root = document.createElement('div');
    root.innerHTML =
      '<button class="fb-fab" id="fbFab" aria-haspopup="dialog" aria-expanded="false">' + ICON.chat +
        '<span class="fb-fab-label">Feedback</span></button>' +
      '<div class="fb-overlay" id="fbOverlay"></div>' +
      '<div class="fb-panel" id="fbPanel" role="dialog" aria-modal="true" aria-label="Send feedback">' +
        '<div id="fbForm">' +
          '<div class="fb-head">' +
            '<div><h3>Send feedback</h3><p>Found a bug or have an idea? Tell us.</p></div>' +
            '<button class="fb-close" id="fbClose" aria-label="Close">' + ICON.close + '</button>' +
          '</div>' +
          '<div class="fb-body">' +
            '<div class="fb-seg" role="tablist">' +
              '<button type="button" class="active" data-type="bug">' + ICON.bug + 'Bug</button>' +
              '<button type="button" data-type="idea">' + ICON.idea + 'Suggestion</button>' +
            '</div>' +
            '<div class="fb-row">' +
              '<label class="fb-label" for="fbMsg" id="fbMsgLabel">What went wrong?</label>' +
              '<textarea class="fb-field" id="fbMsg" placeholder="Describe the bug — what you expected vs. what happened…"></textarea>' +
            '</div>' +
            '<div class="fb-row">' +
              '<label class="fb-label" for="fbEmail">Email (optional)</label>' +
              '<input class="fb-field" id="fbEmail" type="email" placeholder="you@example.com — if you want a reply" />' +
            '</div>' +
            '<div class="fb-context">' + ICON.page + '<span>Reporting on <b id="fbPage"></b></span></div>' +
            '<button class="fb-submit" id="fbSubmit" disabled>' + ICON.send + 'Send feedback</button>' +
          '</div>' +
        '</div>' +
        '<div class="fb-done" id="fbDone" style="display:none">' +
          '<div class="check">' + ICON.check + '</div>' +
          '<h3>Thanks for the report!</h3>' +
          '<p id="fbDoneMsg">Your feedback helps make the guide better.</p>' +
          '<button id="fbAnother">Send another</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    const q = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
    const fab = q<HTMLButtonElement>('#fbFab');
    const overlay = q<HTMLDivElement>('#fbOverlay');
    const panel = q<HTMLDivElement>('#fbPanel');
    const closeBtn = q<HTMLButtonElement>('#fbClose');
    const seg = Array.from(root.querySelectorAll<HTMLButtonElement>('.fb-seg button'));
    const msg = q<HTMLTextAreaElement>('#fbMsg');
    const msgLabel = q<HTMLLabelElement>('#fbMsgLabel');
    const email = q<HTMLInputElement>('#fbEmail');
    const submit = q<HTMLButtonElement>('#fbSubmit');
    const form = q<HTMLDivElement>('#fbForm');
    const done = q<HTMLDivElement>('#fbDone');
    const doneMsg = q<HTMLParagraphElement>('#fbDoneMsg');
    const another = q<HTMLButtonElement>('#fbAnother');
    q<HTMLElement>('#fbPage').textContent = pageName;

    let type = 'bug';
    const copy: Record<string, {label: string; ph: string; done: string}> = {
      bug: {
        label: 'What went wrong?',
        ph: 'Describe the bug — what you expected vs. what happened…',
        done: 'We log every bug report. Thanks for helping us squash it.',
      },
      idea: {
        label: 'What would make this better?',
        ph: 'Share your suggestion — a missing topic, a clearer example, anything…',
        done: 'Great ideas shape the next revision. Thanks for sending it.',
      },
    };

    const open = () => {
      overlay.classList.add('open');
      panel.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      window.setTimeout(() => msg.focus(), 180);
    };
    const close = () => {
      overlay.classList.remove('open');
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    };
    const checkValid = () => {
      submit.disabled = msg.value.trim().length < 3;
    };

    const onFab = () => (panel.classList.contains('open') ? close() : open());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    fab.addEventListener('click', onFab);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onKey);

    seg.forEach((b) => {
      b.addEventListener('click', () => {
        seg.forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        type = b.dataset.type || 'bug';
        msgLabel.textContent = copy[type].label;
        msg.setAttribute('placeholder', copy[type].ph);
        msg.focus();
      });
    });

    msg.addEventListener('input', checkValid);

    const onSubmit = () => {
      if (submit.disabled) return;
      const payload: Payload = {
        type,
        message: msg.value.trim(),
        email: email.value.trim(),
        page: pageName,
        url: location.href,
        ts: new Date().toISOString(),
      };
      // eslint-disable-next-line no-console
      console.log('[feedback]', payload);
      try {
        const store = JSON.parse(localStorage.getItem('maeg-feedback') || '[]');
        store.push(payload);
        localStorage.setItem('maeg-feedback', JSON.stringify(store));
      } catch (e) {
        /* ignore */
      }

      // 1) Ping Discord (best-effort — never blocks the UI).
      sendDiscord(payload);

      // 2) Open a prefilled GitHub issue in a new tab (must stay in the click
      //    handler so it isn't treated as a blocked popup).
      const gh = githubIssueUrl(payload);
      if (gh) window.open(gh, '_blank', 'noopener');

      // 3) Confirm — reflect what actually happened.
      const bits: string[] = [];
      if (gh) bits.push('opened a prefilled GitHub issue in a new tab');
      if (CONFIG.discordWebhook) bits.push('pinged the team on Discord');
      doneMsg.textContent = bits.length
        ? 'We’ve ' + bits.join(' and ') + '. Review the issue and hit Submit to file it.'
        : copy[type].done;

      form.style.display = 'none';
      done.style.display = 'block';
    };
    submit.addEventListener('click', onSubmit);

    another.addEventListener('click', () => {
      msg.value = '';
      email.value = '';
      checkValid();
      done.style.display = 'none';
      form.style.display = 'block';
      msg.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKey);
      root.remove();
    };
  }, [githubRepo]);

  return null;
}
