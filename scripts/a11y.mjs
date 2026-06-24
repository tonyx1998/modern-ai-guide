#!/usr/bin/env node
/**
 * Accessibility check runner.
 *
 * 1. Builds the production site (unless --no-build is passed).
 * 2. Serves the build on a fixed port in the background.
 * 3. Waits for the server to answer.
 * 4. Runs pa11y-ci against the routes in .pa11yci.json (WCAG2AA).
 * 5. Stops the server and exits non-zero if pa11y found violations.
 *
 * Cross-platform: spawns the Docusaurus / pa11y-ci CLIs via their
 * resolved JS entry points using the current Node binary, so it does
 * not depend on shell shebangs or *.cmd shims and works on Windows.
 *
 * Usage:
 *   node scripts/a11y.mjs            # build, serve, audit
 *   node scripts/a11y.mjs --no-build # reuse existing build/ dir
 */
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import {existsSync} from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const PORT = 4001;
const HOST = 'localhost';
const READY_URL = `http://${HOST}:${PORT}/modern-ai-guide/`;
const skipBuild = process.argv.includes('--no-build');

function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, {stdio: 'inherit', cwd: root, ...opts});
    child.on('error', rej);
    child.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${args.join(' ')} exited ${code}`))));
  });
}

// Resolve the Docusaurus CLI entry point so we can run it with `node`.
function docusaurusBin() {
  // @docusaurus/core exposes its bin via package.json "bin".
  const pkgPath = require.resolve('@docusaurus/core/package.json');
  const pkg = require(pkgPath);
  const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.docusaurus;
  return resolve(dirname(pkgPath), binRel);
}

function pa11yBin() {
  const pkgPath = require.resolve('pa11y-ci/package.json');
  const pkg = require(pkgPath);
  const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin['pa11y-ci'];
  return resolve(dirname(pkgPath), binRel);
}

function waitForServer(url, {tries = 60, intervalMs = 1000} = {}) {
  return new Promise((res, rej) => {
    let n = 0;
    const tick = () => {
      const req = http.get(url, (r) => {
        r.resume();
        // Any HTTP response (even a redirect) means the server is up.
        res();
      });
      req.on('error', () => {
        if (++n >= tries) return rej(new Error(`Server did not become ready at ${url}`));
        setTimeout(tick, intervalMs);
      });
      req.setTimeout(2000, () => req.destroy());
    };
    tick();
  });
}

async function main() {
  const docusaurus = docusaurusBin();

  if (!skipBuild) {
    console.log('› Building production site…');
    await run(process.execPath, [docusaurus, 'build']);
  }

  if (!existsSync(resolve(root, 'build'))) {
    throw new Error('No build/ directory found. Run without --no-build first.');
  }

  console.log(`› Serving build/ on ${READY_URL} …`);
  const server = spawn(
    process.execPath,
    [docusaurus, 'serve', '--port', String(PORT), '--host', HOST, '--no-open'],
    {stdio: 'inherit', cwd: root},
  );

  let exitCode = 1;
  try {
    await waitForServer(READY_URL);
    console.log('› Server ready. Running pa11y-ci (WCAG2AA)…');
    await run(process.execPath, [pa11yBin(), '--config', '.pa11yci.json']);
    exitCode = 0; // pa11y-ci exits 0 only when there are no violations.
    console.log('✓ No accessibility violations found.');
  } catch (err) {
    console.error(`✗ ${err.message}`);
    exitCode = 1;
  } finally {
    // Kill the serve process (and its tree on Windows).
    if (server.pid && !server.killed) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], {stdio: 'ignore'});
      } else {
        server.kill('SIGTERM');
      }
    }
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
