import captureWebsite from 'capture-website';
import chromium from "chrome-aws-lambda";

export default async function handler(req, res) {
  try {

    const test = await captureWebsite.buffer('https://sindresorhus.com', {
      launchOptions: {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless
      }
    });
console.log('test', test)
    res.status(200).json({
      test
    });

  } catch(e) {
    console.log('e', e)

    res.status(500).json({
      e
    });
  }
}
