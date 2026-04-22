import { findSiteImagesByUrl } from '@/lib/scraping-server';
import { cleanUrl } from '@/lib/util';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '256kb',
    },
  },
};

const SCRAPING_TIMEOUT = 45 * 1000;

function parseBody(req) {
  const body = req.body;
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    return body;
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = parseBody(req);
  const siteUrl = parsed?.siteUrl;
  if (!siteUrl || typeof siteUrl !== 'string') {
    return res.status(400).json({ error: 'Missing siteUrl' });
  }

  const cleanSiteUrl = cleanUrl(siteUrl);

  try {
    let images;

    try {
      const results = await Promise.race([
        findSiteImagesByUrl(siteUrl),
        new Promise((resolve) => {
          setTimeout(() => resolve('SCRAPING_TIMEOUT'), SCRAPING_TIMEOUT);
        }),
      ]);

      if (!results) {
        console.log(`[${cleanSiteUrl}][Scrape] No results found.`);
        throw new Error('No results found');
      }
      if (results === 'SCRAPING_TIMEOUT') {
        console.log(`[${cleanSiteUrl}][Scrape] Timed out.`);
        throw new Error('Scraping timed out');
      }

      images = results;
      console.log(`[${cleanSiteUrl}][Scrape] ${images.length} images found.`);
    } catch (e) {
      console.log(`[${cleanSiteUrl}][Scrape] Error: ${e.message}`, e);
      if (e.message.includes('Scraping timed out')) {
        throw new Error('We had trouble connecting to this website.');
      }
      throw e;
    }

    const host = new URL(siteUrl).host;
    images = await Promise.all(
      images.map(async (image) => {
        const { src, loading } = image;
        let imgUrl = src;

        if (imgUrl.startsWith('//')) {
          imgUrl = `https:${imgUrl}`;
        }

        if (!imgUrl.startsWith('http')) {
          if (!imgUrl.startsWith('/')) {
            imgUrl = `/${imgUrl}`;
          }
          imgUrl = `https://${host}${imgUrl}`;
        }

        return {
          url: imgUrl,
          loading,
        };
      })
    );

    return res.status(200).json({ images });
  } catch (e) {
    console.log(`[${cleanSiteUrl}][Scrape] Failed to scrape website: ${e.message}`);
    return res.status(500).json({
      error: e.message,
    });
  }
}
