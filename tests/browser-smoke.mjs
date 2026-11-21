// Browser smoke test that serves the production build under the same project
// subpath as GitHub Pages, detecting blank screens and JavaScript errors.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname, join } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('dist');
const prefix = '/minecraft-tier-by-tier/';
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.ico': 'image/x-icon'
};
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (!pathname.startsWith(prefix)) {
    response.writeHead(404).end('Unexpected path: ' + pathname);
    return;
  }
  let rel = decodeURIComponent(pathname.slice(prefix.length)) || 'index.html';
  const filename = resolve(root, rel);
  if (!(filename === root || filename.startsWith(root + sep))) {
    response.writeHead(403).end();
    return;
  }
  try {
    let resource = filename;
    if ((await stat(filename)).isDirectory()) resource = join(filename, 'index.html');
    const contents = await readFile(resource);
    response.writeHead(200, { 'Content-Type': mime[extname(resource)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(contents);
  } catch (error) {
    response.writeHead(404).end('File not found: ' + rel);
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const address = `http://127.0.0.1:${server.address().port}${prefix}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  for (const [label, viewport] of [['desktop', { width: 1400, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, serviceWorkers: 'block' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(`JS: ${error.stack || error.message}`));
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
    await page.goto(address, { waitUntil: 'networkidle' });
    await page.locator('.hero-panel h1').waitFor({ state: 'visible', timeout: 10000 });
    const text = await page.locator('#root').innerText();
    assert.match(text, /Uma vila nasce/, label + ': missing Bellacera content');
    await page.locator('nav:visible').getByRole('button', {name:'Materiais', exact:true}).click();
    await page.locator('.concrete-panel h2').waitFor({state:'visible'});
    await page.locator('.concrete-panel input[type="number"]').fill('1000');
    assert.match(await page.locator('.recipe').innerText(), /500/, label + ': concrete math missing');
    await page.locator('nav:visible').getByRole('button', {name:'Jornada', exact:true}).click();
    await page.locator('.goal-check').first().click();
    await page.waitForFunction(() => {
      const raw=localStorage.getItem('bellacera:world:v2');
      return Boolean(raw && Object.keys(JSON.parse(raw).completed).length>0);
    });
    assert.equal(errors.length, 0, label + ': ' + errors.join('\n'));
    console.log(`PASS ${label}: rendered main view under ${prefix}`);
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  await new Promise((done) => server.close(done));
}
