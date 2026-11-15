import { chromium } from 'playwright';

const url = 'https://andreaselias.github.io/minecraft-tier-by-tier/';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    const responses = [];
    page.on('pageerror', (err) => errors.push('JS: ' + (err.stack || err.message)));
    page.on('requestfailed', (req) => errors.push('Network: ' + req.url() + ' -> ' + req.failure()?.errorText));
    page.on('response', (res) => {
      responses.push(res.status() + ' ' + res.url());
      if (res.status() >= 400) errors.push('HTTP ' + res.status() + ': ' + res.url());
    });
    try {
      const initial = await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
      console.log(label, 'URL:', page.url(), 'initial HTTP:', initial?.status());
      console.log(label, 'title:', await page.title());
      console.log(label, 'root text length:', (await page.locator('#root').innerText().catch(() => '')).length);
      console.log(label, 'responses:', responses.slice(0, 20));
      if (errors.length) console.log(label, 'errors:', errors);
      await page.locator('.hero-panel h1').waitFor({ state: 'visible', timeout: 10000 });
      if (errors.length) throw new Error(errors.join('\n'));
      console.log('PASS LIVE', label);
    } catch (e) {
      console.error('LIVE SITE ERROR', label, String(e));
      console.log('HTML HEAD', (await page.content()).slice(0, 2000));
      await page.screenshot({ path: '/tmp/tier-live-'+label+'.png', fullPage: true }).catch(() => {});
      process.exitCode = 1;
    }
    await context.close();
  }
} finally { await browser.close(); }
