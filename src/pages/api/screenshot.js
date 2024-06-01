import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

import { restoreUrl } from '@/lib/util';
import { getCloudinary } from '@/lib/cloudinary-server';

const cloudinary = getCloudinary();

export default async function handler(req, res) {
  const body = JSON.parse(req.body);
  const siteUrl = restoreUrl(body.siteUrl);

  try {
    await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar'),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.goto(siteUrl);

    const screenshot = await page.screenshot();

    const resource = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: 'imagecarbon',
        tags: ['imagecarbon', `imagecarbon:site:${siteUrl}`, 'imagecarbon:screenshot'],
        context: {
          siteUrl
        }
      }, function (error, result) {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      })
      .end(screenshot);
    });

    await browser.close();

    res.status(200).json({
      siteUrl,
      data: resource
    });
  } catch(e) {
    console.log(`Failed to get screenshot: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}
