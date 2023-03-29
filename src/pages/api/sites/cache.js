import { getXataClient } from '@/lib/xata';

import { cleanUrl } from '@/lib/util';
import { SCRAPING_CACHE_TIME } from '@/data/scraping';

const xata = getXataClient();

export default async function handler(req, res) {
  const siteUrl = cleanUrl(req.query.url);
  
  try {
    const records = await xata.db.Sites.filter({ siteUrl }).getAll();

    const site = records?.[0]?.record;
    const shouldRefresh = site && new Date(Date.now()) > new Date(site.dateCollected).getTime() + SCRAPING_CACHE_TIME;

    if ( !site || shouldRefresh ) {
      res.status(200).json({});
      return;
    }

    const images = await xata.db.Images.filter({ siteUrl }).getAll();

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

