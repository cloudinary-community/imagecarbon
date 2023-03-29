import { cleanUrl } from '@/lib/util';
import { getSiteByUrl, getImagesBySiteUrl } from '@/lib/sites';
import { SCRAPING_CACHE_TIME } from '@/data/scraping';

export default async function handler(req, res) {
  const siteUrl = cleanUrl(req.query.url);
  
  try {
    const site = await getSiteByUrl(siteUrl);

    const shouldRefresh = site && new Date(Date.now()) > new Date(site.dateCollected).getTime() + SCRAPING_CACHE_TIME;

    if ( !site || shouldRefresh ) {
      res.status(200).json({});
      return;
    }

    const images = await getImagesBySiteUrl(siteUrl);

    res.status(200).json({
      images
    });
  } catch(e) {
    console.log(`[${siteUrl}] Failed to get cache: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}

