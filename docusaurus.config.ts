import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Modern AI Engineer Guide',
  tagline: 'How AI systems are actually built in 2026 — for absolute beginners and beyond',
  favicon: 'img/favicon.ico',

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  ],

  future: {
    v4: true,
  },

  url: 'https://tonyx1998.github.io',
  baseUrl: '/modern-ai-engineer-guide/',

  organizationName: 'tonyx1998',
  projectName: 'modern-ai-engineer-guide',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

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

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          // showLastUpdateTime requires a git repository — re-enable after `git init`.
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
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
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        flowchart: {curve: 'basis', htmlLabels: true, padding: 16, nodeSpacing: 55, rankSpacing: 55},
        sequence: {useMaxWidth: true, mirrorActors: false},
        themeVariables: {
          darkMode: true,
          primaryColor: '#4c1d95',
          primaryTextColor: '#f1f5f9',
          primaryBorderColor: '#a78bfa',
          lineColor: '#a5b4cb',
          secondaryColor: '#334155',
          tertiaryColor: '#1e1b2b',
          fontSize: '15px',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
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
      title: 'Modern AI Engineer Guide',
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Guide',
        },
        {
          to: '/docs/glossary',
          label: 'Glossary',
          position: 'left',
        },
        {
          href: 'https://github.com/tonyx1998/modern-ai-engineer-guide',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Foundations',
          items: [
            {label: 'Introduction', to: '/'},
            {label: '1. Foundations', to: '/docs/foundations'},
            {label: '2. Roadmap', to: '/docs/roadmap'},
            {label: '3. Lifecycle', to: '/docs/lifecycle'},
            {label: '4. Tech Stack', to: '/docs/stack'},
          ],
        },
        {
          title: 'Workflows',
          items: [
            {label: '5. Solo / Indie', to: '/docs/solo'},
            {label: '6. Startup AI Team', to: '/docs/startup'},
            {label: '7. Enterprise AI', to: '/docs/enterprise'},
            {label: '8. Comparison', to: '/docs/comparison'},
          ],
        },
        {
          title: 'Applied',
          items: [
            {label: '9. Decisions', to: '/docs/decisions'},
            {label: '10. Production Patterns', to: '/docs/patterns'},
            {label: '11. Career', to: '/docs/career'},
            {label: '12. Glossary', to: '/docs/glossary'},
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/tonyx1998/modern-ai-engineer-guide',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Modern AI Engineer Guide. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
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
