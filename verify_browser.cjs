const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  const consoleErrors = [];
  const pageErrors = [];
  const wasmRequests = [];
  const modelRequests = [];
  let downloadName = null;

  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('request', (r) => {
    const url = r.url();
    if (url.includes('/wasm')) wasmRequests.push(url);
    if (url.includes('.task')) modelRequests.push(url);
  });
  page.on('download', (d) => { downloadName = d.suggestedFilename(); });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for the AI engine banner to resolve (Online or Unavailable)
    await page.waitForFunction(
      () => document.body.innerText.includes('AI Vision Engine Online') ||
            document.body.innerText.includes('AI Vision Engine Unavailable'),
      { timeout: 90000 }
    ).catch(() => {});
    const bodyText = await page.evaluate(() => document.body.innerText);
    const engineOnline = bodyText.includes('AI Vision Engine Online');

    // Upload front + side test photos
    if (engineOnline) {
      await page.locator('input[type=file]').nth(0).setInputFiles('pose_test.jpg');
      await page.locator('input[type=file]').nth(1).setInputFiles('pose_test.jpg');
      await page.waitForSelector('text=Pose Locked', { timeout: 60000 }).catch(() => {});

      // Extract measurements
      await page.getByRole('button', { name: 'Extract AI Tailoring Measurements' }).click();
      await page.waitForSelector('text=Neck Circumference', { timeout: 30000 }).catch(() => {});

      // Open report modal, export PDF via jsPDF/html2canvas
      await page.getByRole('button', { name: 'Download Tailor PDF Report' }).click();
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
      await page.getByRole('button', { name: 'Download PDF Tech Pack' }).click();
      const download = await downloadPromise;
      if (download) {
        const path = await download.path();
        downloadName = download.suggestedFilename() + ' (' + fs.statSync(path).size + ' bytes)';
      }
    }

    await page.screenshot({ path: 'verify_results.png', fullPage: true });

    const result = {
      engineOnline,
      becameUnavailable: bodyText.includes('AI Vision Engine Unavailable'),
      hasPoseLockedChip: bodyText.includes('Pose Locked'),
      hasSideDepthDetectChip: bodyText.includes('Depth Detect'),
      measurementsCount: (bodyText.match(/Confidence:/g) || []).length,
      wasmRequests: wasmRequests.slice(0, 6),
      modelRequests: modelRequests.slice(0, 3),
      consoleErrors,
      pageErrors,
      downloadName,
    };
    console.log('VERIFY_RESULT ' + JSON.stringify(result));
  } catch (err) {
    console.log('VERIFY_EXCEPTION ' + String(err));
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
