/**
 * Server-only: loads a page in headless Chromium and collects <img> src + loading.
 * Do not import from client components (large puppeteer bundle).
 */

const puppeteer = require('puppeteer-core');
const { getPuppeteerLaunchOptions } = require('./chromium-launch');

function assertHttpUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Invalid URL');
  }
}

export async function findSiteImagesByUrl(url) {
  assertHttpUrl(url);

  let browser;

  try {
    const launchOptions = await getPuppeteerLaunchOptions(puppeteer);
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (type === 'image' || type === 'media' || type === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 38000,
    });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const rawImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map((img) => {
        const src =
          img.currentSrc ||
          img.getAttribute('src') ||
          img.getAttribute('data-src') ||
          '';
        const loading = img.getAttribute('loading') || '';
        return { src, loading };
      });
    });

    return rawImages.filter((i) => i.src && !i.src.includes('data:image/'));
  } catch (e) {
    if (e.name === 'TimeoutError' || /timeout/i.test(String(e.message))) {
      throw new Error('Scraping timed out');
    }
    if (e.code === 'ENOEXEC') {
      throw new Error(
        'Chromium could not start (binary not executable on this OS). On macOS use Chrome and optionally CHROME_EXECUTABLE_PATH; on Linux/serverless use the default Sparticuz bundle.'
      );
    }
    throw e;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
