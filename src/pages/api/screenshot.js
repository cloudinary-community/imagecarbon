const puppeteer = require('puppeteer-core');

const { chromium, getPuppeteerLaunchOptions } = require('../../lib/chromium-launch');

export default async function handler(req, res) {
  try {
    await chromium.font(
      'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf'
    );

    const launchOptions = await getPuppeteerLaunchOptions(puppeteer);
    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.goto('https://spacejelly.dev/');
    const title = await page.title();

    await browser.close();

    res.status(200).json({
      title,
    });
  } catch (e) {
    console.log(`Failed to get screenshot: ${e.message}`);
    res.status(500).json({
      error: e.message,
    });
  }
}
