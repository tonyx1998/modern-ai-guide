# modern-ai-engineer-guide

Docusaurus learning guide — AI engineering curriculum. Follow `GUIDE-STANDARD.md` for all content changes.

## Commands

- `make setup` — `npm ci`
- `make dev` — Docusaurus dev server (`npm start`)
- `make build` — static site build
- `make test` — `npm run typecheck`

## Rules

- Content must conform to `GUIDE-STANDARD.md` (linear, zero prior knowledge, self-contained)
- Sync `GUIDE-STANDARD.md` identically across guide repos when editing the standard
- Do not break existing sidebar / doc IDs without updating cross-links

## Folder prefix vs chapter number

Folder numeric prefixes do NOT match reader-facing chapter numbers — `sidebars.ts` is the
source of truth for chapter order/numbering. Never rename directories (URLs strip the numeric
prefix; renames break links). Current remap:

| Folder | Sidebar chapter |
|---|---|
| `01-foundations` | 1 | 
| `02-roadmap` | 2 |
| `03-lifecycle` | 3 |
| `04-stack` | 4 |
| `13-evaluation` | 5 |
| `14-safety` | 6 |
| `15-fine-tuning` | 7 |
| `16-multimodal` | 8 |
| `05-solo` | 9 |
| `06-startup` | 10 |
| `07-enterprise` | 11 |
| `08-comparison` | 12 |
| `09-decisions` | 13 |
| `10-patterns` | 14 |
| `11-career` | 15 |
| `12-case-studies` | 16 |
| `17-cutting-edge` | 17 |
| `11-glossary.md` | 18 |

When writing "Chapter N" in prose, always use the sidebar chapter number, not the folder prefix.
