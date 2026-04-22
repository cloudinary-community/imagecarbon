/**
 * Server-only: pick a Chromium binary for Puppeteer (local Chrome on macOS vs Sparticuz on Linux).
 */

const fs = require('fs');

const chromium = require('@sparticuz/chromium-min');

const SPARTICUZ_CHROMIUM_TAR =
  'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';

/** Sparticuz pack is Linux-only; on macOS we must use a local Chrome/Chromium binary. */
function findDarwinChromeExecutable() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        return p;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * @returns {Promise<{ mode: 'local' | 'lambda', executablePath: string }>}
 */
async function resolveChromiumExecutable() {
  if (process.env.CHROME_EXECUTABLE_PATH) {
    return { mode: 'local', executablePath: process.env.CHROME_EXECUTABLE_PATH };
  }
  if (process.platform === 'darwin') {
    const mac = findDarwinChromeExecutable();
    if (!mac) {
      throw new Error(
        'Could not find Chrome on this Mac. Install Google Chrome (or Chromium/Edge), or set CHROME_EXECUTABLE_PATH in .env.local to the browser binary. The bundled Sparticuz Chromium is Linux-only and cannot run on macOS.'
      );
    }
    return { mode: 'local', executablePath: mac };
  }
  return {
    mode: 'lambda',
    executablePath: await chromium.executablePath(SPARTICUZ_CHROMIUM_TAR),
  };
}

/** @param {typeof import('puppeteer-core')} puppeteer */
async function getPuppeteerLaunchOptions(puppeteer) {
  const { mode, executablePath } = await resolveChromiumExecutable();
  if (mode === 'local') {
    return {
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }
  return {
    args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  };
}

module.exports = {
  chromium,
  getPuppeteerLaunchOptions,
};
