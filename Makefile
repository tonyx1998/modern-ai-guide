.PHONY: setup dev build test verify a11y

setup:
	mise install 2>/dev/null || true
	npm ci

dev:
	npm start

build:
	npm run build

test:
	npm run typecheck

# Accessibility audit (WCAG2AA) against the production build.
a11y:
	npm run a11y

verify:
	@command -v node >/dev/null
