import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import rehypeTaskListA11y from './src/remark/rehype-task-list-a11y.mjs';

// Dracula's default comment colour (#6272a4) only reaches 3.03:1 on its dark
// background — below the WCAG2AA 4.5:1 floor. Lift it to a lighter blue-grey
// (~5:1) so code comments pass while staying visibly dimmer than live code.
const draculaA11y = {
  ...prismThemes.dracula,
  styles: prismThemes.dracula.styles.map((s) =>
    s.types.includes('comment')
      ? {...s, style: {...s.style, color: '#8e97c6'}}
      : s,
  ),
};

const config: Config = {
  title: 'Modern AI Guide',
  tagline: 'Everything useful in AI in 2026 — from your first API call to agentic systems in production',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://tonyx1998.github.io',
  baseUrl: '/modern-ai-guide/',

  organizationName: 'tonyx1998',
  projectName: 'modern-ai-guide',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  // Set ASK_AI_ENDPOINT at build time to enable the "Ask AI about this page"
  // widget. It must point at YOUR backend that holds the provider API key and
  // proxies the question to an LLM. Empty by default → the widget stays disabled
  // and makes no network calls. No key ever lives in this repo.
  customFields: {
    askAiEndpoint: process.env.ASK_AI_ENDPOINT || '',
  },

  // "Technical Editorial" type system — Space Grotesk / Hanken Grotesk / JetBrains Mono.
  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'},
    },
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // Offline reading: a learning guide benefits from being available
    // without a connection. Service worker + installable PWA manifest.
    // NOTE: icons currently reference favicon.ico only. Proper 192x192 and
    // 512x512 maskable PNG icons should be added to static/img/ and listed
    // in static/manifest.json + the pwaHead below for full installability.
    [
      '@docusaurus/plugin-pwa',
      {
        debug: false,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/modern-ai-guide/img/favicon.ico',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/modern-ai-guide/manifest.json',
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: '#4c1d95',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-status-bar-style',
            content: '#0f0e17',
          },
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          // showLastUpdateTime requires a git repository — re-enable after `git init`.
          showLastUpdateTime: false,
          // Label the disabled checkboxes that GFM task lists generate so they
          // pass WCAG2AA (pa11y). See src/remark/rehype-task-list-a11y.mjs.
          rehypePlugins: [rehypeTaskListA11y],
        },
        blog: false,
        theme: {
          // Shared design tokens + diagram styles come from the guide-kit
          // (single source of truth); the site's own custom.css loads last so
          // it can build on / override them.
          customCss: [
            require.resolve('@throughline/guide-kit/tokens.css'),
            require.resolve('@throughline/guide-kit/styles/mermaid.css'),
            require.resolve('@throughline/guide-kit/quiz.css'),
            require.resolve('@throughline/guide-kit/code-challenge.css'),
            require.resolve('./src/css/custom.css'),
          ],
        },
        // Emit a sitemap.xml in production builds (preset-classic default,
        // made explicit here so it isn't accidentally lost). robots.txt in
        // static/ points crawlers at the generated sitemap.
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
      options: {
        fontFamily: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif",
        flowchart: {curve: 'basis', htmlLabels: true, padding: 16, nodeSpacing: 55, rankSpacing: 55, useMaxWidth: false},
        sequence: {useMaxWidth: false, mirrorActors: false},
        gantt: {useMaxWidth: false},
        themeVariables: {
          darkMode: true,
          primaryColor: '#4c1d95',
          primaryTextColor: '#f1f5f9',
          primaryBorderColor: '#a78bfa',
          lineColor: '#a5b4cb',
          secondaryColor: '#334155',
          tertiaryColor: '#1e1b2b',
          fontSize: '15px',
          fontFamily: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif",
        },
        themeCSS: '.node rect{rx:8px;ry:8px} .node rect,.node polygon{stroke-width:1.5px} .edgePath .path{stroke-width:1.5px} .cluster rect{rx:10px;ry:10px}',
      },
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'Modern AI Guide',
      hideOnScroll: false,
      items: [
        {
          type: 'html',
          position: 'left',
          value: '<span class="nav-ver">2026</span>',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Guide',
        },
        {
          to: '/roadmap',
          label: 'Roadmap',
          position: 'left',
        },
        {
          to: '/docs/glossary',
          label: 'Glossary',
          position: 'left',
        },
        {
          to: '/review',
          label: 'Review',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Fundamentals & building',
          items: [
            {label: 'Introduction', to: '/'},
            {label: '1. Foundations', to: '/docs/foundations'},
            {label: '2. Roadmap', to: '/docs/roadmap'},
            {label: '3. Lifecycle', to: '/docs/lifecycle'},
            {label: '4. Tech Stack', to: '/docs/stack'},
          ],
        },
        {
          title: 'Disciplines & specializations',
          items: [
            {label: '5. Evaluation', to: '/docs/evaluation'},
            {label: '6. Responsible & Safe AI', to: '/docs/safety'},
            {label: '7. Fine-tuning', to: '/docs/fine-tuning'},
            {label: '8. Multimodal & Voice', to: '/docs/multimodal'},
          ],
        },
        {
          title: 'Workflows by scale',
          items: [
            {label: '9. Solo / Indie', to: '/docs/solo'},
            {label: '10. Startup AI Team', to: '/docs/startup'},
            {label: '11. Enterprise AI', to: '/docs/enterprise'},
            {label: '12. Comparison', to: '/docs/comparison'},
          ],
        },
        {
          title: 'Judgment, career & reference',
          items: [
            {label: '13. Decisions', to: '/docs/decisions'},
            {label: '14. Production Patterns', to: '/docs/patterns'},
            {label: '15. Career', to: '/docs/career'},
            {label: '16. Case Studies', to: '/docs/case-studies'},
            {label: '17. Cutting Edge', to: '/docs/cutting-edge/'},
            {label: '18. Glossary', to: '/docs/glossary'},
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/tonyx1998/modern-ai-guide',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Modern AI Guide. Built with Docusaurus. · Built by <a href="https://www.toyinyu.com/">To Yin Yu</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: draculaA11y,
      additionalLanguages: [
        'bash',
        'json',
        'yaml',
        'toml',
        'docker',
        'sql',
        'tsx',
        'jsx',
        'python',
        'http',
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
