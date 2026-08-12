const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  const consoleAll = [];
  const pageErrors = [];
  const wasmRequests = [];
  const modelRequests = [];
  const badResponses = [];
  const workerErrors = [];
  const workerConsole = [];
  let downloadInfo = null;

  page.on('console', (m) => consoleAll.push(m.type() + ': ' + m.text()));
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('request', (r) => {
    const url = r.url();
    if (url.includes('/wasm')) wasmRequests.push(url);
    if (url.includes('.task')) modelRequests.push(url);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) badResponses.push(r.status() + ' ' + r.url());
  });
  page.on('worker', (w) => {
    w.on('error', (e) => workerErrors.push(String(e)));
    w.on('console', (m) => workerConsole.push(m.type() + ': ' + m.text()));
  });
  page.on('download', (d) => { downloadInfo = d.suggestedFilename(); });

  const out = {};
  try {
    await page.goto('http://localhost:3100', { waitUntil: 'networkidle', timeout: 60000 });

    const engineResolved = await page.waitForFunction(
      () => document.body.innerText.includes('AI Vision Engine Online') ||
            document.body.innerText.includes('AI Vision Engine Unavailable'),
      { timeout: 90000 }
    ).then(() => true).catch(() => false);
    out.engineResolved = engineResolved;
    out.engineText = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('p')).find(p => /AI Vision Engine/.test(p.textContent));
      return el ? el.textContent : 'NOT FOUND';
    });

    await page.locator('input[type=file]').nth(0).setInputFiles('pose_test.jpg');
    await page.locator('input[type=file]').nth(1).setInputFiles('pose_test.jpg');
    await page.waitForTimeout(15000);

    out.poseLocked = await page.getByText('Pose Locked').count();
    out.poseNotFound = await page.getByText('Pose Not Found').count();
    out.errorBox = await page.evaluate(() => {
      const box = document.querySelector('.bg-rose-950\\/50');
      return box ? box.textContent.trim().slice(0, 300) : null;
    });

    const extractBtn = page.getByRole('button', { name: 'Extract AI Tailoring Measurements' });
    out.extractDisabled = await extractBtn.isDisabled().catch(() => '?');

    if (!out.extractDisabled) {
      await extractBtn.click();
      await page.waitForSelector('text=Neck Circumference', { timeout: 30000 }).catch(() => {});
      out.measurementsCount = await page.getByText(/Confidence:/).count();

      await page.getByRole('button', { name: 'Download Tailor PDF Report' }).click();
      const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
      await page.getByRole('button', { name: 'Download PDF Tech Pack' }).click();
      const download = await dl;
      if (download) {
        const p = await download.path();
        downloadInfo = download.suggestedFilename() + ' :: ' + fs.statSync(p).size + ' bytes';
      }
      out.downloadInfo = downloadInfo;
      await page.screenshot({ path: 'verify_results.png', fullPage: true });
    }

    out.wasmCount = wasmRequests.length;
    out.modelCount = modelRequests.length;
    out.badResponses = badResponses.slice(0, 8);
    out.workerErrors = workerErrors.slice(0, 5);
    out.workerConsole = workerConsole.slice(0, 8);
    out.consoleAll = consoleAll.filter(l => !l.startsWith('log:')).slice(0, 12);
    out.pageErrors = pageErrors.slice(0, 5);

    console.log('VERIFY_RESULT ' + JSON.stringify(out, null, 2));
  } catch (err) {
    console.log('VERIFY_EXCEPTION ' + String(err));
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
